const express = require('express');
const router = express.Router();
const GIE = require('../models/GIE'); // Ajustez le chemin selon votre structure
const { getArrondissement, getCommune, getRegionNameByCode } = require('../utils/geoData');


router.get('/gie-senegal', async (req,res) => {

     try {
        // Pipeline d'agrégation MongoDB pour calculer les statistiques par région
        const pipeline = [
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$region",
                    nombreGIE: { $sum: 1 },
                    totalAdherents: { 
                        $sum: { 
                            $size: { $ifNull: ["$membresComplets", []] }
                        } 
                    },
                    totalInvestissements: { 
                        $sum: { 
                            $toDouble: { 
                                $ifNull: [
                                    { $cond: { if: { $eq: ["$montantInvestissement", ""] }, then: 0, else: "$montantInvestissement" } }, 
                                    0
                                ] 
                            } 
                        } 
                    },
                    gies: { 
                        $push: {
                            _id: "$_id",
                            nomGIE: "$nomGIE",
                            identifiantGIE: "$identifiantGIE",
                            numeroProtocole: "$numeroProtocole",
                            departement: "$departement",
                            commune: "$commune",
                            arrondissement: "$arrondissement",
                            codeRegion: "$codeRegion",
                            codeDepartement: "$codeDepartement", 
                            codeArrondissement: "$codeArrondissement",
                            codeCommune: "$codeCommune",
                            secteurPrincipal: "$secteurPrincipal",
                            nombreMembres: { $size: { $ifNull: ["$membresComplets", []] } },
                            membres: "$membresComplets",
                            montantInvestissement: "$montantInvestissement",
                            statutEnregistrement: "$statutEnregistrement",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id",
                    nombreGIE: 1,
                    totalAdherents: 1,
                    totalInvestissements: 1,
                    gies: 1
                }
            },
            {
                $sort: { region: 1 }
            }
        ];

        const resultats = await GIE.aggregate(pipeline);

        // Enrichir les données avec les noms d'arrondissement et de commune
        const resultatsEnrichis = resultats.map(region => ({
            ...region,
            gies: region.gies.map(gie => ({
                ...gie,
                nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
                nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
            }))
        }));

        res.json({ 
            message: "Rapport GIE Sénégal - données réelles",
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE Sénégal:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport",
            error: error.message
        });
    }

});

router.get('/gie-senegal-regions', async (req, res) => {
    try {
        // Récupérer les codes de régions depuis les paramètres de requête
        const codeRegions = req.query.codeRegions || req.body.codeRegions;
        
        // Valider que codeRegions est fourni
        if (!codeRegions) {
            return res.status(400).json({
                message: "Le paramètre 'codeRegions' est requis",
                error: "Paramètre manquant"
            });
        }

        // S'assurer que codeRegions est un tableau
        const regionsArray = Array.isArray(codeRegions) ? codeRegions : [codeRegions];

        // Pipeline d'agrégation MongoDB pour calculer les statistiques par département des régions spécifiées
        const pipeline = [
            {
                $match: {
                    region: { $in: regionsArray }
                }
            },
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$region",
                        departement: "$departement"
                    },
                    nombreGIE: { $sum: 1 },
                    totalAdherents: { 
                        $sum: { 
                            $size: { $ifNull: ["$membresComplets", []] }
                        } 
                    },
                    totalInvestissements: { 
                        $sum: { 
                            $toDouble: { 
                                $ifNull: [
                                    { $cond: { if: { $eq: ["$montantInvestissement", ""] }, then: 0, else: "$montantInvestissement" } }, 
                                    0
                                ] 
                            } 
                        } 
                    },
                    gies: { 
                        $push: {
                            _id: "$_id",
                            nomGIE: "$nomGIE",
                            identifiantGIE: "$identifiantGIE",
                            numeroProtocole: "$numeroProtocole",
                            departement: "$departement",
                            commune: "$commune",
                            arrondissement: "$arrondissement",
                            codeRegion: "$codeRegion",
                            codeDepartement: "$codeDepartement", 
                            codeArrondissement: "$codeArrondissement",
                            codeCommune: "$codeCommune",
                            secteurPrincipal: "$secteurPrincipal",
                            nombreMembres: { $size: { $ifNull: ["$membresComplets", []] } },
                            membres: "$membresComplets",
                            montantInvestissement: "$montantInvestissement",
                            statutEnregistrement: "$statutEnregistrement",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.region",
                    departements: {
                        $push: {
                            departement: "$_id.departement",
                            nombreGIE: "$nombreGIE",
                            totalAdherents: "$totalAdherents",
                            totalInvestissements: "$totalInvestissements",
                            gies: "$gies"
                        }
                    },
                    nombreTotalGIE: { $sum: "$nombreGIE" },
                    totalTotalAdherents: { $sum: "$totalAdherents" },
                    totalTotalInvestissements: { $sum: "$totalInvestissements" }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id",
                    nombreTotalGIE: 1,
                    totalTotalAdherents: 1,
                    totalTotalInvestissements: 1,
                    departements: 1
                }
            },
            {
                $sort: { region: 1 }
            }
        ];

        const resultats = await GIE.aggregate(pipeline);

        // Enrichir les données avec les noms d'arrondissement et de commune
        const resultatsEnrichis = resultats.map(region => ({
            ...region,
            departements: region.departements.map(dept => ({
                ...dept,
                gies: dept.gies.map(gie => ({
                    ...gie,
                    nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
                    nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
                }))
            }))
        }));

        res.json({ 
            message: `Rapport GIE par départements des régions: ${regionsArray.join(', ')}`,
            regionsdemandees: regionsArray,
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE par départements:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport par départements",
            error: error.message
        });
    }
});

router.get('/gie-senegal-region-departement', async (req, res) => {
    try {
        // Récupérer les paramètres depuis la requête avec plusieurs possibilités
        const codeRegion = req.query.codeRegion || req.query.region || req.body.codeRegion || req.body.region;
        const codeDepartement = req.query.codeDepartement || req.query.departement || req.query.codeDept || req.body.codeDepartement || req.body.departement;
        
        console.log('Paramètres reçus:', { 
            codeRegion, 
            codeDepartement, 
            query: req.query, 
            body: req.body 
        });
        
        // Valider que les paramètres requis sont fournis
        if (!codeRegion || !codeDepartement) {
            return res.status(400).json({
                message: "Les paramètres 'codeRegion' et 'codeDepartement' sont requis",
                error: "Paramètres manquants",
                recu: {
                    codeRegion: codeRegion || 'manquant',
                    codeDepartement: codeDepartement || 'manquant'
                },
                exemples: {
                    url1: "/gie-senegal-region-departement?codeRegion=DAKAR&codeDepartement=01",
                    url2: "/gie-senegal-region-departement?region=DAKAR&departement=01"
                }
            });
        }

        // Pipeline d'agrégation MongoDB pour calculer les statistiques par arrondissement du département spécifié
        const pipeline = [
            {
                $match: {
                    region: codeRegion,
                    codeDepartement: codeDepartement  // Utiliser codeDepartement au lieu de departement
                }
            },
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$region",
                        departement: "$departement",
                        arrondissement: "$arrondissement"
                    },
                    nombreGIE: { $sum: 1 },
                    totalAdherents: { 
                        $sum: { 
                            $size: { $ifNull: ["$membresComplets", []] }
                        } 
                    },
                    totalInvestissements: { 
                        $sum: { 
                            $toDouble: { 
                                $ifNull: [
                                    { $cond: { if: { $eq: ["$montantInvestissement", ""] }, then: 0, else: "$montantInvestissement" } }, 
                                    0
                                ] 
                            } 
                        } 
                    },
                    gies: { 
                        $push: {
                            _id: "$_id",
                            nomGIE: "$nomGIE",
                            identifiantGIE: "$identifiantGIE",
                            numeroProtocole: "$numeroProtocole",
                            departement: "$departement",
                            commune: "$commune",
                            arrondissement: "$arrondissement",
                            codeRegion: "$codeRegion",
                            codeDepartement: "$codeDepartement", 
                            codeArrondissement: "$codeArrondissement",
                            codeCommune: "$codeCommune",
                            secteurPrincipal: "$secteurPrincipal",
                            nombreMembres: { $size: { $ifNull: ["$membresComplets", []] } },
                            membres: "$membresComplets",
                            montantInvestissement: "$montantInvestissement",
                            statutEnregistrement: "$statutEnregistrement",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$_id.region",
                        departement: "$_id.departement"
                    },
                    arrondissements: {
                        $push: {
                            arrondissement: "$_id.arrondissement",
                            nombreGIE: "$nombreGIE",
                            totalAdherents: "$totalAdherents",
                            totalInvestissements: "$totalInvestissements",
                            gies: "$gies"
                        }
                    },
                    nombreTotalGIE: { $sum: "$nombreGIE" },
                    totalTotalAdherents: { $sum: "$totalAdherents" },
                    totalTotalInvestissements: { $sum: "$totalInvestissements" }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id.region",
                    departement: "$_id.departement",
                    nombreTotalGIE: 1,
                    totalTotalAdherents: 1,
                    totalTotalInvestissements: 1,
                    arrondissements: 1
                }
            },
            {
                $sort: { departement: 1 }
            }
        ];

        const resultats = await GIE.aggregate(pipeline);

        // Enrichir les données avec les noms d'arrondissement et de commune
        const resultatsEnrichis = resultats.map(dept => ({
            ...dept,
            arrondissements: dept.arrondissements.map(arr => ({
                ...arr,
                gies: arr.gies.map(gie => ({
                    ...gie,
                    nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
                    nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
                }))
            }))
        }));

        res.json({ 
            message: `Rapport GIE par arrondissements du département (code: ${codeDepartement}) de la région ${codeRegion}`,
            regionDemandee: codeRegion,
            departementDemande: codeDepartement,
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE par arrondissements:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport par arrondissements",
            error: error.message
        });
    }
});

// Nouvelle route : GIE par communes d'un arrondissement spécifique
router.get('/gie-senegal-departement-arrondissement', async (req, res) => {
    try {
        // Récupérer les paramètres depuis la requête avec plusieurs possibilités
        const codeRegion = req.query.codeRegion || req.query.region || req.body.codeRegion || req.body.region;
        const codeDepartement = req.query.codeDepartement || req.query.departement || req.query.codeDept || req.body.codeDepartement || req.body.departement;
        const codeArrondissement = req.query.codeArrondissement || req.query.arrondissement || req.query.codeArr || req.body.codeArrondissement || req.body.arrondissement;
        
        console.log('Paramètres reçus:', { 
            codeRegion, 
            codeDepartement, 
            codeArrondissement,
            query: req.query, 
            body: req.body 
        });
        
        // Valider que les paramètres requis sont fournis
        if (!codeRegion || !codeDepartement || !codeArrondissement) {
            return res.status(400).json({
                message: "Les paramètres 'codeRegion', 'codeDepartement' et 'codeArrondissement' sont requis",
                error: "Paramètres manquants",
                recu: {
                    codeRegion: codeRegion || 'manquant',
                    codeDepartement: codeDepartement || 'manquant',
                    codeArrondissement: codeArrondissement || 'manquant'
                },
                exemples: {
                    url1: "/gie-senegal-departement-arrondissement?codeRegion=DAKAR&codeDepartement=01&codeArrondissement=05",
                    url2: "/gie-senegal-departement-arrondissement?region=DAKAR&departement=01&arrondissement=05"
                }
            });
        }

        // Pipeline d'agrégation MongoDB pour calculer les statistiques par commune de l'arrondissement spécifié
        const pipeline = [
            {
                $match: {
                    region: codeRegion,
                    codeDepartement: codeDepartement,
                    codeArrondissement: codeArrondissement
                }
            },
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$region",
                        departement: "$departement", 
                        arrondissement: "$arrondissement",
                        commune: "$commune"
                    },
                    nombreGIE: { $sum: 1 },
                    totalAdherents: { 
                        $sum: { 
                            $size: { $ifNull: ["$membresComplets", []] }
                        } 
                    },
                    totalInvestissements: { 
                        $sum: { 
                            $toDouble: { 
                                $ifNull: [
                                    { $cond: { if: { $eq: ["$montantInvestissement", ""] }, then: 0, else: "$montantInvestissement" } }, 
                                    0
                                ] 
                            } 
                        } 
                    },
                    gies: { 
                        $push: {
                            _id: "$_id",
                            nomGIE: "$nomGIE",
                            identifiantGIE: "$identifiantGIE",
                            numeroProtocole: "$numeroProtocole",
                            departement: "$departement",
                            commune: "$commune",
                            arrondissement: "$arrondissement",
                            codeRegion: "$codeRegion",
                            codeDepartement: "$codeDepartement", 
                            codeArrondissement: "$codeArrondissement",
                            codeCommune: "$codeCommune",
                            secteurPrincipal: "$secteurPrincipal",
                            nombreMembres: { $size: { $ifNull: ["$membresComplets", []] } },
                            membres: "$membresComplets",
                            montantInvestissement: "$montantInvestissement",
                            statutEnregistrement: "$statutEnregistrement",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$_id.region",
                        departement: "$_id.departement",
                        arrondissement: "$_id.arrondissement"
                    },
                    communes: {
                        $push: {
                            commune: "$_id.commune",
                            nombreGIE: "$nombreGIE",
                            totalAdherents: "$totalAdherents",
                            totalInvestissements: "$totalInvestissements",
                            gies: "$gies"
                        }
                    },
                    nombreTotalGIE: { $sum: "$nombreGIE" },
                    totalTotalAdherents: { $sum: "$totalAdherents" },
                    totalTotalInvestissements: { $sum: "$totalInvestissements" }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id.region",
                    departement: "$_id.departement",
                    arrondissement: "$_id.arrondissement",
                    nombreTotalGIE: 1,
                    totalTotalAdherents: 1,
                    totalTotalInvestissements: 1,
                    communes: 1
                }
            },
            {
                $sort: { commune: 1 }
            }
        ];

        const resultats = await GIE.aggregate(pipeline);

        // Enrichir les données avec les noms d'arrondissement et de commune
        const resultatsEnrichis = resultats.map(arr => ({
            ...arr,
            communes: arr.communes.map(commune => ({
                ...commune,
                gies: commune.gies.map(gie => ({
                    ...gie,
                    nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
                    nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
                }))
            }))
        }));

        res.json({ 
            message: `Rapport GIE par communes de l'arrondissement (code: ${codeArrondissement}) du département (code: ${codeDepartement}) de la région ${codeRegion}`,
            regionDemandee: codeRegion,
            departementDemande: codeDepartement,
            arrondissementDemande: codeArrondissement,
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE par communes:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport par communes",
            error: error.message
        });
    }
});

// Route pour récupérer tous les GIE d'un arrondissement spécifique
router.get('/gie-senegal-arrondissement', async (req, res) => {
    try {
        // Récupérer les paramètres depuis la requête
        const codeRegion = req.query.codeRegion || req.query.region;
        const codeDepartement = req.query.codeDepartement || req.query.departement;
        const codeArrondissement = req.query.codeArrondissement || req.query.arrondissement;
        
        console.log('Paramètres reçus pour GIE arrondissement:', { 
            codeRegion, 
            codeDepartement, 
            codeArrondissement 
        });
        
        // Valider que les paramètres requis sont fournis
        if (!codeRegion || !codeDepartement || !codeArrondissement) {
            return res.status(400).json({
                message: "Les paramètres 'codeRegion', 'codeDepartement' et 'codeArrondissement' sont requis",
                error: "Paramètres manquants",
                recu: {
                    codeRegion: codeRegion || 'manquant',
                    codeDepartement: codeDepartement || 'manquant',
                    codeArrondissement: codeArrondissement || 'manquant'
                },
                exemple: "/gie-senegal-arrondissement?codeRegion=DAKAR&codeDepartement=02&codeArrondissement=01"
            });
        }

        // Pipeline d'agrégation MongoDB pour récupérer tous les GIE de l'arrondissement
        const pipeline = [
            {
                $match: {
                    region: codeRegion,
                    codeDepartement: codeDepartement,
                    codeArrondissement: codeArrondissement
                }
            },
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        region: "$region",
                        departement: "$departement",
                        arrondissement: "$arrondissement"
                    },
                    nombreTotalGIE: { $sum: 1 },
                    totalTotalAdherents: { 
                        $sum: { 
                            $size: { $ifNull: ["$membresComplets", []] }
                        } 
                    },
                    totalTotalInvestissements: { 
                        $sum: { 
                            $toDouble: { 
                                $ifNull: [
                                    { $cond: { if: { $eq: ["$montantInvestissement", ""] }, then: 0, else: "$montantInvestissement" } }, 
                                    0
                                ] 
                            } 
                        } 
                    },
                    gies: { 
                        $push: {
                            _id: "$_id",
                            nomGIE: "$nomGIE",
                            identifiantGIE: "$identifiantGIE",
                            numeroProtocole: "$numeroProtocole",
                            departement: "$departement",
                            commune: "$commune",
                            arrondissement: "$arrondissement",
                            codeRegion: "$codeRegion",
                            codeDepartement: "$codeDepartement", 
                            codeArrondissement: "$codeArrondissement",
                            codeCommune: "$codeCommune",
                            secteurPrincipal: "$secteurPrincipal",
                            nombreMembres: { $size: { $ifNull: ["$membresComplets", []] } },
                            membres: "$membresComplets",
                            montantInvestissement: "$montantInvestissement",
                            statutEnregistrement: "$statutEnregistrement",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    region: "$_id.region",
                    departement: "$_id.departement",
                    arrondissement: "$_id.arrondissement",
                    nombreTotalGIE: 1,
                    totalTotalAdherents: 1,
                    totalTotalInvestissements: 1,
                    gies: 1
                }
            }
        ];

        const resultats = await GIE.aggregate(pipeline);

        // Enrichir les données avec les noms d'arrondissement et de commune
        const resultatsEnrichis = resultats.map(arr => ({
            ...arr,
            gies: arr.gies.map(gie => ({
                ...gie,
                nomArrondissement: getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement),
                nomCommune: getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune)
            }))
        }));

        res.json({ 
            message: `Rapport GIE de l'arrondissement (code: ${codeArrondissement}) du département (code: ${codeDepartement}) de la région ${codeRegion}`,
            regionDemandee: codeRegion,
            departementDemande: codeDepartement,
            arrondissementDemande: codeArrondissement,
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE arrondissement:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport GIE arrondissement",
            error: error.message
        });
    }
});

// Route pour récupérer tous les GIE d'une commune spécifique
router.get('/gie-senegal-commune', async (req, res) => {
    try {
        // Récupérer les paramètres depuis la requête
        const codeRegion = req.query.codeRegion || req.query.region;
        const codeDepartement = req.query.codeDepartement || req.query.departement;
        const codeArrondissement = req.query.codeArrondissement || req.query.arrondissement;
        const codeCommune = req.query.codeCommune || req.query.commune;
        
        console.log('Paramètres reçus pour GIE commune:', { 
            codeRegion, 
            codeDepartement, 
            codeArrondissement,
            codeCommune 
        });
        
        // Valider que les paramètres requis sont fournis
        if (!codeRegion || !codeDepartement || !codeArrondissement || !codeCommune) {
            return res.status(400).json({
                message: "Les paramètres 'codeRegion', 'codeDepartement', 'codeArrondissement' et 'codeCommune' sont requis",
                error: "Paramètres manquants",
                recu: {
                    codeRegion: codeRegion || 'manquant',
                    codeDepartement: codeDepartement || 'manquant',
                    codeArrondissement: codeArrondissement || 'manquant',
                    codeCommune: codeCommune || 'manquant'
                },
                exemple: "/gie-senegal-commune?codeRegion=DAKAR&codeDepartement=02&codeArrondissement=01&codeCommune=02"
            });
        }
        
        // Convertir le code de région en nom si nécessaire
        let regionName = codeRegion;
        if (/^\d+$/.test(codeRegion)) {
            // Si c'est un code numérique, le convertir en nom
            const convertedName = getRegionNameByCode(codeRegion);
            if (convertedName) {
                regionName = convertedName;
                console.log(`Code région ${codeRegion} converti en nom: ${regionName}`);
            } else {
                console.warn(`Impossible de convertir le code région: ${codeRegion}`);
            }
        }
        
        // Construire le filtre de recherche
        const filtre = {
            region: regionName,
            codeDepartement: codeDepartement,
            codeArrondissement: codeArrondissement,
            codeCommune: codeCommune
        };
        
        console.log('Filtre MongoDB pour commune:', filtre);
        
        // Pipeline d'agrégation pour récupérer les GIE avec membres enrichis
        const pipeline = [
            { $match: filtre },
            {
                $addFields: {
                    // Ajouter la présidente aux membres si elle n'y est pas déjà
                    membresComplets: {
                        $let: {
                            vars: {
                                presidenteExiste: {
                                    $anyElementTrue: {
                                        $map: {
                                            input: { $ifNull: ["$membres", []] },
                                            as: "membre",
                                            in: { $eq: ["$$membre.cin", "$presidenteCIN"] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: "$$presidenteExiste",
                                    then: { $ifNull: ["$membres", []] },
                                    else: {
                                        $concatArrays: [
                                            { $ifNull: ["$membres", []] },
                                            [{
                                                nom: "$presidenteNom",
                                                prenom: "$presidentePrenom",
                                                fonction: "Présidente",
                                                cin: "$presidenteCIN",
                                                telephone: "$presidenteTelephone",
                                                genre: "femme",
                                                email: { $ifNull: ["$presidenteEmail", ""] }
                                            }]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    nombreMembres: { $size: "$membresComplets" }
                }
            },
            {
                $project: {
                    _id: 1,
                    nomGIE: 1,
                    identifiantGIE: 1,
                    numeroProtocole: 1,
                    departement: 1,
                    commune: 1,
                    arrondissement: 1,
                    codeRegion: 1,
                    codeDepartement: 1,
                    codeArrondissement: 1,
                    codeCommune: 1,
                    nomArrondissement: 1,
                    nomCommune: 1,
                    secteurPrincipal: 1,
                    nombreMembres: 1,
                    membres: "$membresComplets",
                    statutEnregistrement: 1,
                    createdAt: 1
                }
            },
            { $sort: { nomGIE: 1 } }
        ];
        
        // Exécuter l'agrégation
        const gies = await GIE.aggregate(pipeline);
        
        console.log(`Nombre de GIE trouvés pour la commune ${codeCommune}:`, gies.length);
        
        // Calculer les statistiques globales
        const nombreTotalGIE = gies.length;
        const totalTotalAdherents = gies.reduce((sum, gie) => sum + gie.nombreMembres, 0);
        const totalTotalInvestissements = gies.reduce((sum, gie) => sum + (gie.montantInvestissement || 0), 0);
        
        // Enrichir les données avec les noms géographiques
        const giesEnrichis = gies.map(gie => {
            try {
                const arrondissementInfo = getArrondissement(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement);
                const communeInfo = getCommune(gie.codeRegion, gie.codeDepartement, gie.codeArrondissement, gie.codeCommune);
                
                return {
                    ...gie,
                    nomArrondissement: arrondissementInfo ? arrondissementInfo.nom : gie.nomArrondissement || `Arrondissement ${gie.codeArrondissement}`,
                    nomCommune: communeInfo ? communeInfo.nom : gie.nomCommune || `Commune ${gie.codeCommune}`
                };
            } catch (error) {
                console.warn('Erreur lors de l\'enrichissement géographique pour GIE:', gie.identifiantGIE, error.message);
                return {
                    ...gie,
                    nomArrondissement: gie.nomArrondissement || `Arrondissement ${gie.codeArrondissement}`,
                    nomCommune: gie.nomCommune || `Commune ${gie.codeCommune}`
                };
            }
        });
        
        // Structurer la réponse selon le format attendu
        const resultatsEnrichis = [{
            region: codeRegion,
            departement: codeDepartement,
            arrondissement: codeArrondissement,
            commune: codeCommune,
            nombreTotalGIE: nombreTotalGIE,
            totalTotalAdherents: totalTotalAdherents,
            totalTotalInvestissements: totalTotalInvestissements,
            gies: giesEnrichis
        }];
        
        // Retourner la réponse
        res.json({ 
            message: `Rapport GIE de la commune (code: ${codeCommune}) de l'arrondissement (code: ${codeArrondissement}) du département (code: ${codeDepartement}) de la région ${codeRegion}`,
            regionDemandee: codeRegion,
            departementDemande: codeDepartement,
            arrondissementDemande: codeArrondissement,
            communeDemandee: codeCommune,
            data: resultatsEnrichis
        });

    } catch (error) {
        console.error('Erreur lors de la génération du rapport GIE commune:', error);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport GIE commune",
            error: error.message
        });
    }
});


module.exports = router;

