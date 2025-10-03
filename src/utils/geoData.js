// Données géographiques du Sénégal
const SENEGAL_GEOGRAPHIC_DATA = {
   "DAKAR": {
    nom: "Dakar",
    code: "01",
    departements: {
      "DAKAR": {
        nom: "Dakar",
        code: "01",
        arrondissements: [
          {
            nom: "GOREE",
            code: "01",
            communes: [{
              code: "01",
              nom: "GOREE"
            }]
          },
          {
            nom: "DAKAR-PLATEAU",
            code: "02",
            communes: [
              {
                code: "01",
                nom: "DAKAR-PLATEAU"
              },
              {
                code: "02",
                nom: "MEDINA"
              },
              {
                code: "03",
                nom: "GEULE TAPEE FASS COLOBANE"
              },
              {
                code: "04",
                nom: "FANN POINT E AMITIE"
              }
            ]
          },
          {
            nom: "GRAND-DAKAR",
            code: "03",
            communes: [

              {
                code: "01",
                nom: "GRAND DAKAR"
              },
              {
                code: "02",
                nom: "BISCUTERIE"
              },
              {
                code: "03",
                nom: "HLM"
              },
              {
                code: "04",
                nom: "HANN-BEL AIR"
              },
              {
                code: "05",
                nom: "SICAP-LIBERTE"
              },
              {
                code: "06",
                nom: "DIEUPPEUL-DERKLE"
              }
            ]
          },
          {
            nom: "ALMADIES",
            code: "04",
            communes: [
              {
                code: "01",
                nom: "OUAKAM"
              },
              {
                code: "02",
                nom: "NGOR"
              },
              {
                code: "03",
                nom: "YOFF"
              },
              {
                code: "04",
                nom: "MERMOZ SACRE COEUR"
              }

            ]
          },
          {
            nom: "PARCELLES ASSAINIES",
            code: "05",
            communes: [
              {
                code: "01",
                nom: "GRAND YOFF"
              },
              {
                code: "02",
                nom: "PATTE D'OIE"
              },
              {
                code: "03",
                nom: "PARCELLES ASSAINIES"
              },
              {
                code: "04",
                nom: "CAMBERENE"
              }
            ]
          }
        ]
      },
      "PIKINE": {
        nom: "Pikine",
        code: "02",
        arrondissements: [
          {
            nom: "VILLE DE PIKINE",
            code: "01",
            communes: [
              { code: "01", nom: "PIKINE OUEST" },
              { code: "02", nom: "PIKINE EST" },
              { code: "03", nom: "PIKINE NORD" },
              { code: "04", nom: "DALIFORT" },
              { code: "05", nom: "DJIDAH THIAROYE KAO" },
              { code: "06", nom: "GUINAW RAIL NORD" },
              { code: "07", nom: "GUINAW RAIL SUD" },
              { code: "08", nom: "THIAROYE SUR MER " },
              { code: "09", nom: "TIVAOUANE DIACKSA" },
              { code: "10", nom: "DIAMAGEUNE SICAP MBAO" },
              { code: "11", nom: "THIAROYE GARE" },
              { code: "12", nom: "MBAO" }
            ]
          }
        ]
      },
      "RUFISQUE": {
        nom: "Rufisque",
        code: "03",
        arrondissements: [
          {
            nom: "BARGNY",
            code: "01",
            communes: [
              {
                code: "01",
                nom: "BARGNY"
              }
            ]
          },
          {
            nom: "SENDOU",
            code: "02",
            communes: [
              {
                code: "01",
                nom: "SENDOU"
              },

            ]
          },
          {
            nom: "SANGALKAM",
            code: "03",
            communes: [
              { code: "01", nom: "BAMBILOR" },
              { code: "02", nom: "SANGALKAM" },
              { code: "03", nom: "TIVAOUNE PEULH NIAGHA" }
            ]
          },
          {
            nom: "DIAMNIADIO",
            code: "04",
            communes: [
              {
                code: "01",
                nom: "YENE"
              },
              {
                code: "02",
                nom: "SEBIKOTANE"
              },
              {
                code: "03",
                nom: "DIAMNIADIO"
              }

            ]
          },
          {
            nom: "VILLE DE RUFISQUE",
            code: "05",
            communes: [
              {
                code: "01",
                nom: "RUFISQUE EST"
              },
              {
                code: "02",
                nom: "RUFISQUE NORD"
              },
              {
                code: "03",
                nom: "RUFISQUE OUEST"
              }
            ]
          }

        ]
      },

      "GUEDIAWAYE": {
        nom: "Guédiawaye",
        code: "04",
        arrondissements: [
          {
            nom: "VILLE DE GUEDIAWAYE",
            code: "01",
            communes: [
              { code: "01", nom: "GOLF SUD" },
              { code: "02", nom: "SAM NOTAIRE" },
              { code: "03", nom: "MEDINA GOUNASS" },
              { code: "04", nom: "NDIARAME LIMAMOULAYE" },
              { code: "05", nom: "WAKHINANE NIMZATT" }
            ]
          }
        ]
      },
      "KEUR_MASSAR": {
        nom: "Keur Massar",
        code: "05",
        arrondissements: [
          {
            nom: "YEUMBEUL NORD",
            code: "01",
            communes: [
              { code: "01", nom: "YEUMBEUL NORD" },
              { code: "02", nom: "YEUMBEUL SUD" }
            ]
          },
          {
            nom: "MALIKA",
            code: "02",
            communes: [
              { code: "01", nom: "KEUR MASSAR NORD" },
              { code: "02", nom: "MALIKA" }
            ]
          },
          {
            nom: "JAXAAY",
            code: "03",
            communes: [
              { code: "01", nom: "JAXAAY PARCELLES" },
              { code: "02", nom: "KEUR MASSAR SUD" }
            ]
          }
        ]
      }
    }
  },

  "DIOURBEL": {
    nom: "Diourbel",
    code: "02",
    departements: {
      "BAMBEY": {
        nom: "Bambey",
        code: "01",
        arrondissements: [
          {
            nom: "BAMBEY",
            code: "01",
            communes: [
              { code: "01", nom: "BAMBEY" }
            ]
          },
          {
            nom: "BABA GARAGE",
            code: "02",
            communes: [
              { code: "01", nom: "BABA GARAGE" },
              { code: "02", nom: "DINGUIRAYE" },
              { code: "03", nom: "KEUR SAMBA KANE" }
            ]
          },
          {
            nom: "LAMBAYE",
            code: "03",
            communes: [
              { code: "01", nom: "GAWANE" },
              { code: "02", nom: "LAMBAYE" },
              { code: "03", nom: "NGOGOM" },
              { code: "04", nom: "REFANE" }
            ]
          },
          {
            nom: "NGOYE",
            code: "04",
            communes: [
              { code: "01", nom: "NDANGALMA" },
              { code: "02", nom: "NDONDOL" },
              { code: "03", nom: "NGOYE" },
              { code: "04", nom: "THIAKHAR" }
            ]
          }
        ]
      },
      "DIOURBEL": {
        nom: "Diourbel",
        code: "02",
        arrondissements: [
          {
            nom: "DIOURBEL",
            code: "01",
            communes: [
              { code: "01", nom: "DIOURBEL" }
            ]
          },
          {
            nom: "NDINDY",
            code: "02",
            communes: [
              { code: "01", nom: "NDANKH SENE" },
              { code: "02", nom: "GADE ESCALE" },
              { code: "03", nom: "NDINDY" },
              { code: "04", nom: "KEUR NGALGOU" },
              { code: "05", nom: "TAIBA MOUTOUPHA" },
              { code: "06", nom: "TOUBA LAPPE" }
            ]
          },
          {
            nom: "NDOULO",
            code: "03",
            communes: [
              { code: "01", nom: "NDOULO" },
              { code: "02", nom: "NGOHE" },
              { code: "03", nom: "PATTAR" },
              { code: "04", nom: "TOCKY GARE" },
              { code: "05", nom: "TOURE MBONDE" }

            ]
          }
        ]
      },
      "MBACKE": {
        nom: "MBACKE",
        code: "03",
        arrondissements: [
          {
            nom: "MBACKE",
            code: "01",
            communes: [
              { code: "01", nom: "MBACKE" },

            ]
          },
          {
            nom: "KAEL",
            code: "02",
            communes: [
              { code: "01", nom: "DENDEYE GOUYE GUI" },
              { code: "02", nom: "DAROU SALAM TYP" },
              { code: "03", nom: "KAEL" },
              { code: "04", nom: "MADINA" },
              { code: "05", nom: "N’DIOUMANE T. THIEKENE" },
              { code: "06", nom: "TOUBA M’BOUL" },
              { code: "07", nom: "DAROU NAHIM" },
              { code : "08", nom: "TAIBA TIECKENE" }
            ]
          },
          {
            nom: "NDAME",
            code: "03",
            communes: [
              { code: "01", nom: "DALLA N’GABOU" },
              { code: "02", nom: "MISSIRAH" },
              { code: "03", nom: "N’GHAYE" },
              { code: "04", nom: "TOUBA FALL" },
              { code: "05", nom: "TOUBA MOSQUEE" }
            ]
          },
          {
            nom: "TAIF",
            code: "04",
            communes: [
              { code: "01", nom: "SADIO" },
              { code: "02", nom: "TAÏF" }
            ]
          }
        ]
      }
    }
  },

  "FATICK": {
    nom: "Fatick",
    code: "03",
    departements: {
      "FATICK": {
        nom: "Fatick",
        code: "01",
        arrondissements: [
          {
            nom: "FATICK",
            code: "01",
            communes: [
              { code: "01", nom: "FATICK" }
            ]
          },
          {
            nom: "DIOFFIOR",
            code: "02",
            communes: [
              { code: "01", nom: "DIOFFIOR" }
            ]
          },
          {
            nom: "NDIOP",
            code: "03",
            communes: [
              { code: "01", nom: "DIAOULE" },
              { code: "02", nom: "MBELLACADIAO" },
              { code: "03", nom: "NDIOP" },
              { code: "04", nom: "THIARE NDIALGUI" },
              { code: "05", nom: "DIAKHAO" }
            ]
          },
          {
            nom: "FIMELA",
            code: "04",
            communes: [
              { code: "01", nom: "FIMELA" },
              { code: "02", nom: "LOUL SESSENE" },
              { code: "03", nom: "PALMARIN FACAO" },
              { code: "04", nom: "DJILASSE" }
            ]
          },
          {
            nom: "NIAKHAR",
            code: "05",
            communes: [
              { code: "01", nom: "NGAYOKHEME" },
              { code: "02", nom: "NIAKHAR" },
              { code: "03", nom: "PATAR" },

            ]
          },
          {
            nom: "TATTAGUINE",
            code: "06",
            communes: [
              { code: "01", nom: "DIARRERE" },
              { code: "02", nom: "DIOUROUP" },
              { code: "03", nom: "TATTAGUINE" }
            ]
          }
        ]
      },
      "FOUNDIOUGNE": {
        nom: "Foundiougne",
        code: "02",
        arrondissements: [
          {
            nom: "FOUNDIOUGNE",
            code: "01",
            communes: [
              { code: "01", nom: "FOUNDIOUGNE" }
            ]
          },
          {
            nom: "SOKONE",
            code: "02",
            communes: [
              { code: "01", nom: "SOKONE" }
            ]
          },
          {
            nom: "DJILOR",
            code: "03",
            communes: [
              { code: "01", nom: "DJILOR" },
              { code: "02", nom: "DIOSSONG" },
              { code: "03", nom: "DIAGANE BARKA" },
              { code: "04", nom: "MBAM" },
              { code: "05", nom: "PASSY" },
              { code: "06", nom: "SOUM" }

            ]
          },
          {
            nom: "NIODIOR",
            code: "04",
            communes: [
              { code: "01", nom: "BASSOUL" },
              { code: "02", nom: "DIONEWAR" },
              { code: "03", nom: "DJIRNDA" },
              { code: "04", nom: "KEUR SALOUM DIANE" },
              { code: "05", nom: "KEUR SAMBA GUEYE" },
              { code: "06", nom: "NIORO ALASSANE TALL" },
              { code: "07", nom: "TOUBACOUTA" },
              { code: "08", nom: "KARANG POSTE" }
            ]
          }
        ]
      },
      "GOSSAS": {
        nom: "Gossas",
        code: "03",
        arrondissements: [
          {
            nom: "GOSSAS",
            code: "01",
            communes: [
              { code: "01", nom: "GOSSAS" },
            ]
          },
          {
            nom: "COLOBANE",
            code: "02",
            communes: [
              { code: "01", nom: "COLOBANE" },
              { code: "02", nom: "MBAR" }
            ]
          },
          {
            nom: "OUADIOUR",
            code: "03",
            communes: [
              { code: "01", nom: "NDIENE LAGANE" },
              { code: "02", nom: "OUADIOUR" },
              { code: "03", nom: "PATAR LIA" }
            ]
          }
        ]
      }
    }
  },

  "KAFFRINE": {
    nom: "Kaffrine",
    code: "04",
    departements: {
      "KAFFRINE": {
        nom: "Kaffrine",
        code: "01",
        arrondissements: [
          {
            nom: "KAFFRINE",
            code: "01",
            communes: [
              { code: "01", nom: "KAFFRINE" }
            ]
          },
          {
            nom: "GNIBY",
            code: "02",
            communes: [
              { code: "01", nom: "BOULEL" },
              { code: "02", nom: "GNIBY" },
              { code: "03", nom: "KAHI" }
            ]
          },
          {
            nom: "KATAKEL",
            code: "03",
            communes: [
              { code: "01", nom: "DIOKOUL BELBOUCK" },
              { code: "02", nom: "KATHIOTTE" },
              { code: "03", nom: "MEDINATOUL SALAM 2" },
              { code: "04", nom: "DIAMAGADIO" },
              { code: "05", nom: "NGANDA" }
            ]
          }
        ]
      },
      "BIRKELANE": {
        nom: "BIRKELANE",
        code: "01",
        arrondissements: [
          {
            nom: "BIRKELANE",
            code: "01",
            communes: [
              { code: "01", nom: "BIRKELANE" }
            ]
          },
          {
            nom: "KEUR MBOUCKI",
            code: "02",
            communes: [
              { code: "01", nom: "KEUR MBOUCKI" },
              { code: "02", nom: "TOUBA MBELLA" },
              { code: "03", nom: "DIAMAL" },

            ]
          },
          {
            nom: "MABO",
            code: "03",
            communes: [
              { code: "01", nom: "MABO" },
              { code: "02", nom: "NDIOGNICK" },
              { code: "03", nom: "MBEULEUP" },
              { code: "04", nom: "SEGRE GATTA" }
            ]
          }
        ]
      },
      "KOUNGHEUL": {
        nom: "Koungheul",
        code: "03",
        arrondissements: [
          {
            nom: "KOUNGHEUL",
            code: "01",
            communes: [
              { code: "01", nom: "KOUNGHEUL" }
            ]
          },
          {
            nom: "IDA MOURIDE",
            code: "02",
            communes: [
              { code: "01", nom: "SALY ESCALE" },
              { code: "02", nom: "FASS THIEKENE" },
              { code: "03", nom: "IDA MOURIDE" }
            ]
          },
          {
            nom: "LOUR ESCALE",
            code: "03",
            communes: [
              { code: "01", nom: "LOUR ESCALE" },
              { code: "02", nom: "RIBOT ESCALE" },
            ]
          },
          {
            nom: "MISSIRAH WADENE",
            code: "04",
            communes: [
              { code: "01", nom: "NGAINTHE PATHE" },
              { code: "02", nom: "MAKA YOP" },
              { code: "03", nom: "MISSIRAH WADENE" }
            ]
          }
        ]
      },
      "MALEM HODAR": {
        nom: "Malem Hodar",
        code: "04",
        arrondissements: [
          {
            nom: "MALEM HODAR",
            code: "01",
            communes: [
              { code: "01", nom: "MALEM HODAR"}
            ]
          },
          {
            nom: "Darou Minam II",
            code: "01",
            communes: [
              { code: "01", nom: "Darou Minam II" },
              { code: "02", nom: "Ndioum Ngainth" },
              { code: "03", nom: "Khelcom" },
              { code: "04", nom: "Ndiobene Samba Lamo" }
            ]
          },
          {
            nom: "SAGNA",
            code: "02",
            communes: [
              { code: "01", nom: "Dianke Souf" },
              { code: "02", nom: "Sagna" }
            ]
          }
        ]
      }
    }
  },


  "KAOLACK": {
    nom: "Kaolack",
    code: "05",
    departements: {
      "KAOLACK": {
        nom: "Kaolack",
        code: "01",
        arrondissements: [
          {
            nom: "VILLE DE KAOLACK",
            code: "01",
            communes: [
              { code: "01", nom: "KAOLACK" }
            ]
          },
          {
            nom: "KAHONE",
            code: "02",
            communes: [
              { code: "01", nom: "KAHONE" }
            ]
          },
          {
            nom: "NDIEDIENG",
            code: "03",
            communes: [
              { code: "01", nom: "KEUR SOCE" },
              { code: "02", nom: "NDIAFFATE" },
              { code: "03", nom: "NDIEDIENG" }
            ]
          },
          {
            nom: "KOUMBAL",
            code: "04",
            communes: [
              { code: "01", nom: "LATMINGUE" },
              { code: "02", nom: "KEUR BAKA" },
              { code: "03", nom: "NDOFFANE" },
              { code: "04", nom: "THIARE" }
            ]
          },
          {
            nom: "NGOTHIE",
            code: "05",
            communes: [
              { code: "01", nom: "DYA" },
              { code: "02", nom: "NDIEBEL" },
              { code: "03", nom: "THIOMBY" },
              { code: "04", nom: "GANDIAYE" },
              { code: "05", nom: "SIBASSOR" },

            ]
          }
        ]
      },
      "GUINGUINEO": {
        nom: "Guinguinéo",
        code: "02",
        arrondissements: [
          {
            nom: "GUINGUINEO",
            code: "01",
            communes: [
              { code: "01", nom: "GUINGUINEO" }
            ]
          },
          {
            nom: "MBADAKHOUNE",
            code: "02",
            communes: [
              { code: "01", nom: "MBADAKHOUNE" },
              { code: "02", nom: "NDIAGO" },
              { code: "03", nom: "NGATHIE NAOUDE" },
              { code: "04", nom: "KHELCOM BIRAME" },
              { code: "05", nom: "FASS" }
            ]
          },
          {
            nom: "NGUELOU",
            code: "03",
            communes: [
              { code: "01", nom: "GAGNICK" },
              { code: "02", nom: "NGUELOU" },
              { code: "03", nom: "OUROUR" },
              { code: "04", nom: "DARA MBOSS" },
              { code: "05", nom: "PANAL OUOLOF" },
              { code: "06", nom: "MBOSS" }
            ]
          }

        ]
      },
      "NIORO": {
        nom: "Nioro du Rip",
        code: "03",
        arrondissements: [
          {
            nom: "NIORO",
            code: "01",
            communes: [
              { code: "01", nom: "NIORO" },
            ]
          },
          {
            nom: "MEDINA-SABAKH",
            code: "02",
            communes: [
              { code: "01", nom: "KAYEMOR" },
              { code: "02", nom: "MEDINA-SABAKH" },
              { code: "03", nom: "NGAYENE" }
            ]
          },
          {
            nom: "PAOSKOTO",
            code: "03",
            communes: [
              { code: "01", nom: "GAINTE KAYE" },
              { code: "02", nom: "PAOSKOTO" },
              { code: "03", nom: "POROKHANE" },
              { code: "04", nom: "TAÏBA NIASSENE" },
              { code: "05", nom: "DABALY" },
              { code: "06", nom: "DAROU SALAM" }
            ]
          },
          {
            nom: "WACK-NGOUNA",
            code: "04",
            communes: [
              { code: "01", nom: "KEUR MABA DIAKHOU" },
              { code: "02", nom: "NDRAME ESCALE" },
              { code: "03", nom: "WACK NGOUNA" },
              { code: "04", nom: "KEUR MANDONGO" },
              { code: "05", nom: "KEUR MADIABEL" }
            ]
          }
        ]
      }
    }
  },

  "KEDOUGOU": {
    nom: "Kédougou",
    code: "06",
    departements: {
      "KEDOUGOU": {
        nom: "Kédougou",
        code: "01",
        arrondissements: [
          {
            nom: "KEDOUGOU",
            code: "01",
            communes: [
              { code: "01", nom: "KEDOUGOU" }
            ]
          },
          {
            nom: "BANDAFASSI",
            code: "02",
            communes: [
              { code: "01", nom: "BANDAFASSI" },
              { code: "02", nom: "TOMBORONKOTO" },
              { code: "03", nom: "DINDIFELO" },
              { code: "04", nom: "NINEFECHA" }
            ]
          },
          {
            nom: "FONGOLEMBI",
            code: "03",
            communes: [
              { code: "01", nom: "DIMBOLI" },
              { code: "02", nom: "FONGOLEMBI" }
            ]
          }
        ]
      },
      "SALEMATA": {
        nom: "Salemata",
        code: "02",
        arrondissements: [
          {
            nom: "SALEMATA",
            code: "01",
            communes: [
              { code: "01", nom: "SALEMATA" }
            ]
          },
          {
            nom: "DAKATELI",
            code: "02",
            communes: [
              { code: "01", nom: "DAKATELI" },
              { code: "02", nom: "KEVOYE" }
            ]
          },
          {
            nom: "DAR SALAM",
            code: "03",
            communes: [
              { code: "01", nom: "DAR SALAM" },
              { code: "02", nom: "ETHIOLO" },
              { code: "03", nom: "OUBADJI" }
            ]
          }
        ]
      },
      "SARAYA": {
        nom: "Saraya",
        code: "03",
        arrondissements: [
          {
            nom: "SARAYA",
            code: "01",
            communes: [
              { code: "01", nom: "SARAYA" }
            ]
          },
          {
            nom: "BEMBOU",
            code: "02",
            communes: [
              { code: "01", nom: "MEDINA BAFFE" },
              { code: "02", nom: "BEMBOU" }
            ]
          },
          {
            nom: "SABODOLA",
            code: "03",
            communes: [
              { code: "01", nom: "KHOSSANTO" },
              { code: "02", nom: "MISSIRAH SIRIMANA" },
              { code: "03", nom: "SABODALA" }
            ]
          }
        ]
      }
    }
  },

  "KOLDA": {
    nom: "Kolda",
    code: "07",
    departements: {
      "KOLDA": {
        nom: "Kolda",
        code: "01",
        arrondissements: [
          {
            nom: "KOLDA",
            code: "01",
            communes: [
              { code: "01", nom: "KOLDA" }
            ]
          },
          {
            nom: "DIOULACOLON",
            code: "02",
            communes: [
              { code: "01", nom: "DIOULACOLON" },
              { code: "02", nom: "MEDINA EL HADJI" },
              { code: "03", nom: "TANKANTO ESCALE" },
              { code: "04", nom: "GUIRO YERO BOCAR" },
              { code: "05", nom: "SALIKEGNE" },
              { code: "06", nom: "SARE YOBA DIEGA" }
            ]
          },
          {
            nom: "MAMPATIM",
            code: "03",
            communes: [
              { code: "01", nom: "BAGADADJI" },
              { code: "02", nom: "COUMBACARA" },
              { code: "03", nom: "MAMPATIM" },
              { code: "04", nom: "DIALAMBERE" },
              { code: "05", nom: "MEDINA CHERIF" },
              { code: "06", nom: "DABO" }
            ]
          },
          {
            nom: "SARE BIDJI",
            code: "04",
            communes: [
              { code: "01", nom: "SARE BIDJI" },
              { code: "02", nom: "THIETTY" }
            ]
          }
        ]
      },
      "VELINGARA": {
        nom: "Vélingara",
        code: "02",
        arrondissements: [
          {
            nom: "VELINGARA",
            code: "01",
            communes: [
              { code: "01", nom: "VELINGARA" }
            ]
          },
          {
            nom: "BONCONTO",
            code: "02",
            communes: [
              { code: "01", nom: "BONCONTO" },
              { code: "02", nom: "LINKERING" },
              { code: "03", nom: "MEDINA GOUNASS" },
              { code: "04", nom: "SINTHIANG KOUNDARA" }
            ]
          },
          {
            nom: "PAKOUR",
            code: "03",
            communes: [
              { code: "01", nom: "OUASSADOU" },
              { code: "02", nom: "PAROUMBA" },
              { code: "03", nom: "PAKOUR" }
            ]
          },
          {
            nom: "SARE COLY SALLE",
            code: "04",
            communes: [
              { code: "01", nom: "KANDIA" },
              { code: "02", nom: "SARE COLY SALLE" },
              { code: "03", nom: "NEMATABA" },
              { code: "04", nom: "KANDIAYE" },
              { code: "05", nom: "DIAOUBE- KABENDOU" },
              { code: "06", nom: "KOUNKANE" }
            ]
          }
        ]
      },
      "MEDINA_YORO_FOULAH": {
        nom: "Médina Yoro Foulah",
        code: "03",
        arrondissements: [
          {
            nom: "MEDINA YORO FOULAH",
            code: "01",
            communes: [
              { code: "01", nom: "MEDINA YORO FOULAH" }
            ]
          },
          {
            nom: "FAFACOUROU",
            code: "02",
            communes: [
              { code: "01", nom: "FAFACOUROU" },
              { code: "02", nom: "BADION" }
            ]
          },
          {
            nom: "NDORNA",
            code: "03",
            communes: [
              { code: "01", nom: "NDORNA" },
              { code: "02", nom: "BIGNARABE" },
              { code: "03", nom: "BOUROUCO" },
              { code: "04", nom: "KOULINTO" }
            ]
          },
          {
            nom: "NIAMING",
            code: "04",
            communes: [
              { code: "01", nom: "DINGUIRAYE" },
              { code: "02", nom: "KEREWANE" },
              { code: "03", nom: "NIAMING" },
              { code: "04", nom: "PATA" }
            ]
          }
        ]
      }
    }
  },

  "LOUGA": {
    nom: "Louga",
    code: "08",
    departements: {
      "KEBEMER": {
        nom: "Kébémer",
        code: "01",
        arrondissements: [
          {
            nom: "KEBEMER",
            code: "01",
            communes: [
              { code: "01", nom: "KEBEMER" }
            ]
          },
          {
            nom: "DAROU MOUSTY",
            code: "02",
            communes: [
              { code: "01", nom: "DAROU MARNANE" },
              { code: "02", nom: "DAROU MOUSTY" },
              { code: "03", nom: "MBADIANE" },
              { code: "04", nom: "NDOYENE" },
              { code: "05", nom: "SAM YABAL" },
              { code: "06", nom: "TOUBA MERINA" },
              { code: "07", nom: "MBACKE CADIOR" }
            ]
          },
          {
            nom: "NDANDE",
            code: "03",
            communes: [
              { code: "01", nom: "BADEGNE OUOLOF" },
              { code: "02", nom: "DIOKOUL DIAWRIGNE" },
              { code: "03", nom: "KAB GAYE" },
              { code: "04", nom: "NDANDE" },
              { code: "05", nom: "THIEPPE" },
              { code: "06", nom: "GUEOUL" }
            ]
          },
          {
            nom: "SAGATTA GUETH",
            code: "04",
            communes: [
              { code: "01", nom: "KANENE NDIOB" },
              { code: "02", nom: "LORO" },
              { code: "03", nom: "SAGATTA GUETH" },
              { code: "04", nom: "THIOLOM FALL" },
              { code: "05", nom: "NGOURANE OUOLOF" }
            ]
          }
        ]
      },
      "LINGUERE": {
        nom: "Linguère",
        code: "02",
        arrondissements: [
          {
            nom: "LINGUERE",
            code: "01",
            communes: [
              { code: "01", nom: "LINGUERE" }
            ]
          },
          {
            nom: "DAHRA",
            code: "02",
            communes: [
              { code: "01", nom: "DAHRA" }
            ]
          },
          {
            nom: "BARKEDJI",
            code: "03",
            communes: [
              { code: "01", nom: "BARKEDJI" },
              { code: "02", nom: "GASSANE" },
              { code: "03", nom: "THIARGNY" },
              { code: "04", nom: "THIEL" }
            ]
          },
          {
            nom: "DODJI",
            code: "04",
            communes: [
              { code: "01", nom: "DODJI" },
              { code: "02", nom: "LABGAR" },
              { code: "03", nom: "OUARKHOH" }
            ]
          },
          {
            nom: "YANG YANG",
            code: "05",
            communes: [
              { code: "01", nom: "KAMB" },
              { code: "02", nom: "MBOULA" },
              { code: "03", nom: "TESSEKRE FORAGE" },
              { code: "04", nom: "YANG YANG" },
              { code: "05", nom: "MBEULEUKHE" }
            ]
          },
          {
            nom: "SAGATTA DJOLOF",
            code: "06",
            communes: [
              { code: "01", nom: "BOULAL" },
              { code: "02", nom: "DEALI" },
              { code: "03", nom: "SAGATTA DJOLOF" },
              { code: "04", nom: "THIAMENE DJOLOF" },
              { code: "05", nom: "AFFE DJOLOFF" }
            ]
          }
        ]
      },
      "LOUGA": {
        nom: "Louga",
        code: "03",
        arrondissements: [
          {
            nom: "LOUGA",
            code: "01",
            communes: [
              { code: "01", nom: "LOUGA" }
            ]
          },
          {
            nom: "COKI",
            code: "02",
            communes: [
              { code: "01", nom: "COKI" },
              { code: "02", nom: "PETE OUARACK" },
              { code: "03", nom: "THIAMENE CAYOR" },
              { code: "04", nom: "GUET ARDO" },
              { code: "05", nom: "NDIAGNE" }
            ]
          },
          {
            nom: "KEUR MOMAR SARR",
            code: "03",
            communes: [
              { code: "01", nom: "GANDE" },
              { code: "02", nom: "KEUR MOMAR SARR" },
              { code: "03", nom: "NGUER MALAL" },
              { code: "04", nom: "SYER" }
            ]
          },
          {
            nom: "MBEDIENE",
            code: "04",
            communes: [
              { code: "01", nom: "KELLE GUEYE" },
              { code: "02", nom: "MBEDIENE" },
              { code: "03", nom: "NGUIDILE" },
              { code: "04", nom: "NIOMRE" }
            ]
          },
          {
            nom: "SAKAL",
            code: "05",
            communes: [
              { code: "01", nom: "LEONA" },
              { code: "02", nom: "NGUEUNE SARR" },
              { code: "03", nom: "SAKAL" }
            ]
          }
        ]
      }
    }
  },

  "MATAM": {
    nom: "Matam",
    code: "09",
    departements: {
      "MATAM": {
        nom: "Matam",
        code: "01",
        arrondissements: [
          {
            nom: "MATAM",
            code: "01",
            communes: [
              { code: "01", nom: "MATAM" }
            ]
          },
          {
            nom: "OUROSSOGUI",
            code: "02",
            communes: [
              { code: "01", nom: "OUROSSOGUI" }
            ]
          },
          {
            nom: "AGNAM-CIVOL",
            code: "03",
            communes: [
              { code: "01", nom: "AGNAM-CIVOL" },
              { code: "02", nom: "OREFONDE" },
              { code: "03", nom: "DABIA" },
              { code: "04", nom: "NGUIDILOGNE" },
              { code: "05", nom: "THILOGNE" }
            ]
          },
          {
            nom: "OGO",
            code: "04",
            communes: [
              { code: "01", nom: "BOKIDIAWE" },
              { code: "02", nom: "NABADJI-CIVOL" },
              { code: "03", nom: "OGO" }
            ]
          }
        ]
      },
      "KANEL": {
        nom: "Kanel",
        code: "02",
        arrondissements: [
          {
            nom: "KANEL",
            code: "01",
            communes: [
              { code: "01", nom: "KANEL" }
            ]
          },
          {
            nom: "ORKADIERE",
            code: "02",
            communes: [
              { code: "01", nom: "BOKILADJI" },
              { code: "02", nom: "ORKADIERE" },
              { code: "03", nom: "AOURE" },
              { code: "04", nom: "DEMBANCANE" },
              { code: "05", nom: "ODOBERE" },
              { code: "06", nom: "SEMME" },
              { code: "07", nom: "WAOUNDE" }
            ]
          },
          {
            nom: "OURO SIDY",
            code: "03",
            communes: [
              { code: "01", nom: "NDENDORY" },
              { code: "02", nom: "OURO SIDY" },
              { code: "03", nom: "HAMADY OUNARE" },
              { code: "04", nom: "SINTHIOU BAMANBE-BANADJI" }
            ]
          }
        ]
      },
      "RANEROU_FERLO": {
        nom: "Ranérou Ferlo",
        code: "03",
        arrondissements: [
          {
            nom: "RANEROU",
            code: "01",
            communes: [
              { code: "01", nom: "RANEROU" }
            ]
          },
          {
            nom: "VELINGARA",
            code: "02",
            communes: [
              { code: "01", nom: "LOUGRE-THIOLY" },
              { code: "02", nom: "VELINGARA" },
              { code: "03", nom: "OUDALAYE" }
            ]
          }
        ]
      }
    }
  },

  "SAINT-LOUIS": {
    nom: "Saint-Louis",
    code: "10",
    departements: {
      "DAGANA": {
        nom: "Dagana",
        code: "01",
        arrondissements: [
          {
            nom: "DAGANA",
            code: "01",
            communes: [
              { code: "01", nom: "DAGANA" }
            ]
          },
          {
            nom: "RICHARD-TOLL",
            code: "02",
            communes: [
              { code: "01", nom: "RICHARD-TOLL" }
            ]
          },
          {
            nom: "MBANE",
            code: "03",
            communes: [
              { code: "01", nom: "MBANE" },
              { code: "02", nom: "BOKHOL" },
              { code: "03", nom: "GAE" },
              { code: "04", nom: "NDOMBO SANDJIRY" }
            ]
          },
          {
            nom: "NDIAYE",
            code: "04",
            communes: [
              { code: "01", nom: "DIAMA" },
              { code: "02", nom: "NGNITH" },
              { code: "03", nom: "RONKH" },
              { code: "04", nom: "ROSS-BETHIO" },
              { code: "05", nom: "ROSSO-SENEGAL" }
            ]
          }
        ]
      },
      "PODOR": {
        nom: "Podor",
        code: "02",
        arrondissements: [
          {
            nom: "PODOR",
            code: "01",
            communes: [
              { code: "01", nom: "PODOR" }
            ]
          },
          {
            nom: "NDIOUM",
            code: "02",
            communes: [
              { code: "01", nom: "NDIOUM" }
            ]
          },
          {
            nom: "CAS-CAS",
            code: "03",
            communes: [
              { code: "01", nom: "MEDINA NDIATHBE" },
              { code: "02", nom: "DOUNGA-LAO" },
              { code: "03", nom: "MERY" },
              { code: "04", nom: "AERE LAO" },
              { code: "05", nom: "GOLLERE" },
              { code: "06", nom: "MBOUMBA" },
              { code: "07", nom: "WALALDE" }
            ]
          },
          {
            nom: "SALDE",
            code: "04",
            communes: [
              { code: "01", nom: "BOKE DIALLOUBE" },
              { code: "02", nom: "MBOLO BIRANE" },
              { code: "03", nom: "GALOYA TOUCOULEUR" },
              { code: "04", nom: "PETE" }
            ]
          },
          {
            nom: "THILLE BOUBACAR", 
            code: "05",
            communes: [
              { code: "01", nom: "FANAYE" },
              { code: "02", nom: "NDIAYENE PENDAO" },
              { code: "03", nom: "NDIANDANE" }
            ]
          },
          {
            nom: "GAMADJI SARE",
            code: "06",
            communes: [
              { code: "01", nom: "DODEL" },
              { code: "02", nom: "GAMADJI SARE" },
              { code: "03", nom: "GUEDE VILLAGE" },
              { code: "04", nom: "BODE LAO" },
              { code: "05", nom: "DEMETTE" },
              { code: "06", nom: "GUEDE CHANTIER" }
            ]
          }
        ]
      },
      "SAINT-LOUIS": {
        nom: "Saint-Louis",
        code: "03",
        arrondissements: [
          {
            nom: "SAINT-LOUIS",
            code: "01",
            communes: [
              { code: "01", nom: "SAINT-LOUIS" }
            ]
          },
          {
            nom: "RAO",
            code: "02",
            communes: [
              { code: "01", nom: "GANDON" },
              { code: "02", nom: "FASS NGOM" },
              { code: "03", nom: "N’DIEBENE GANDIOLE" },
              { code: "04", nom: "M’PAL" }
            ]
          }
        ]
      }
    }
  },

  "SEDHIOU": {
    nom: "Sédhiou",
    code: "11",
    departements: {
      "SEDHIOU": {
        nom: "Sédhiou",
        code: "01",
        arrondissements: [
          {
            nom: "SEDHIOU",
            code: "01",
            communes: [
              { code: "01", nom: "SEDHIOU" },
              { code: "02", nom: "" }
            ]
          },
          {
            nom: "MARSASSOUM",
            code: "02",
            communes: [
              { code: "01", nom: "MARSASSOUM" }
            ]
          },
          {
            nom: "DIENDE",
            code: "03",
            communes: [
              { code: "01", nom: "DIENDE" },
              { code: "02", nom: "SAKAR" },
              { code: "03", nom: "DIANNAH BA" },
              { code: "04", nom: "KOUSSY" },
              { code: "05", nom: "OUDOUCAR" },
              { code: "06", nom: "SAMA KANTA PEULH" },
              { code: "07", nom: "DIANAH MALARY" }
            ]
          },
          {
            nom: "DJIBABOUYA",
            code: "04",
            communes: [
              { code: "01", nom: "BENET-BIJINI" },
              { code: "02", nom: "SANSAMBA" },
              { code: "03", nom: "DJIBABOUYA" }
            ]
          },
          {
            nom: "DJIREDJI",
            code: "05",
            communes: [
              { code: "01", nom: "DJIREDJI" },
              { code: "02", nom: "BAMBALI" }
            ]
          }
        ]
      },
      "BOUNKILING": {
        nom: "Bounkiling",
        code: "02",
        arrondissements: [
          {
            nom: "BOUNKILING",
            code: "01",
            communes: [
              { code: "01", nom: "BOUNKILING" }
            ]
          },
          {
            nom: "BOGHAL",
            code: "02",
            communes: [
              { code: "01", nom: "BOGHAL" },
              { code: "02", nom: "TANKON" },
              { code: "03", nom: "DJINANY" },
              { code: "04", nom: "NDIAMALATHIEL" },
              { code: "05", nom: "NDIAMACOUTA" }
            ]
          },
          {
            nom: "BONA",
            code: "03",
            communes: [
              { code: "01", nom: "BONA" },
              { code: "02", nom: "DIACOUNDA" },
              { code: "03", nom: "INOR" },
              { code: "04", nom: "KANDION MANGANA" }
            ]
          },
          {
            nom: "DIAROUME",
            code: "04",
            communes: [
              { code: "01", nom: "DIAROUME" },
              { code: "02", nom: "DIAMBATY" },
              { code: "03", nom: "FAOUNE" },
              { code: "04", nom: "MADINA WANDIFA" }
            ]
          }
        ]
      },
      "GOUDOMP": {
        nom: "Goudomp",
        code: "03",
        arrondissements: [
          {
            nom: "GOUDOMP",
            code: "01",
            communes: [
              { code: "01", nom: "GOUDOMP" }
            ]
          },
          {
            nom: "DJIBANAR",
            code: "02",
            communes: [
              { code: "01", nom: "DJIBANAR" },
              { code: "02", nom: "KAOUR" },
              { code: "03", nom: "MANGAROUNGOU SANTO" },
              { code: "04", nom: "SIMBADI BALANTE" },
              { code: "05", nom: "YARANG BALANTE" },
              { code: "06", nom: "DIATTACOUNDA" },
              { code: "07", nom: "SAMINE" }
            ]
          },
          {
            nom: "KARANTABA",
            code: "03",
            communes: [
              { code: "01", nom: "KARANTABA" },
              { code: "02", nom: "KOLIBANTANG" }
            ]
          },
          {
            nom: "SIMBANDI BRASSOU",
            code: "04",
            communes: [
              { code: "01", nom: "NIAGHA" },
              { code: "02", nom: "SIMBANDI BRASSOU" },
              { code: "03", nom: "BAGHERE" },
              { code: "04", nom: "DIOUBOUDOU" },
              { code: "05", nom: "TANAFF" }
            ]
          }
        ]
      }
    }
  },


  "TAMBACOUNDA": {
    nom: "Tambacounda",
    code: "12",
    departements: {
      "BAKEL": {
        nom: "BAKEL",
        code: "01",
        arrondissements: [
          {
            nom: "BAKEL",
            code: "01",
            communes: [
              { code: "01", nom: "BAKEL" }
            ]
          },
          {
            nom: "BELÉ",
            code: "02",
            communes: [
              { code: "01", nom: "BELÉ" },
              { code: "02", nom: "SINTHIOU-FISSA" },
              { code: "03", nom: "KIDIRA" }
            ]
          },
          {
            nom: "KÉNIABA",
            code: "03",
            communes: [
              { code: "01", nom: "GATHIARY" },
              { code: "02", nom: "MADINA FOULBÉ" },
              { code: "03", nom: "SADATOU" },
              { code: "04", nom: "TOUMBOURA" }
            ]
          },
          {
            nom: "MOUDÉRY",
            code: "04",
            communes: [
              { code: "01", nom: "BALLOU" },
              { code: "02", nom: "GABOU" },
              { code: "03", nom: "MOUDÉRY" },
              { code: "04", nom: "DIAWARA" }
            ]
          }
        ]
      },
      "TAMBACOUNDA": {
        nom: "Tambacounda",
        code: "02",
        arrondissements: [
          {
            nom: "TAMBACOUNDA",
            code: "01",
            communes: [
              { code: "01", nom: "TAMBACOUNDA" }
            ]
          },
          {
            nom: "KOUSSANAR",
            code: "02",
            communes: [
              { code: "01", nom: "KOUSSANAR" },
              { code: "02", nom: "SINTHIOU MALÈME" }
            ]
          },
          {
            nom: "MAKACOULIBANTANG",
            code: "03",
            communes: [
              { code: "01", nom: "MAKACOULIBANTANG" },
              { code: "02", nom: "N'DOGA BABACAR" },
              { code: "03", nom: "NIANI TOUCOULEUR" }
            ]
          },
          {
            nom: "MISSIRAH",
            code: "04",
            communes: [
              { code: "01", nom: "DIALACOTO" },
              { code: "02", nom: "MISSIRAH" },
              { code: "03", nom: "NETTE BOULOU" }
            ]
          }
        ]
      },
      "GOUDIRY": {
        nom: "Goudiry",
        code: "03",
        arrondissements: [
          {
            nom : "Goudiry",
            code: "01",
            communes: [
              { code: "01", nom: "Goudiry" }
            ]
          },
          {
            nom: "BALA",
            code: "02",
            communes: [
              { code: "01", nom: "BALA" },
              { code: "02", nom: "GOUMBAYEL" },
              { code: "03", nom: "KOAR" }
            ]
          },
          {
            nom: "BOYNGUEL BAMBA",
            code: "03",
            communes: [
              { code: "01", nom: "DOUGUÉ" },
              { code: "02", nom: "BOYNGUEL BAMBA" },
              { code: "03", nom: "KOUSSAN" },
              { code: "04", nom: "SINTHIOU MAMADOU BOUBOU" }
            ]
          },
          {
            nom: "DIANKÉ MAKHA",
            code: "03",
            communes: [
              { code: "01", nom: "BANI ISRAËL" },
              { code: "02", nom: "BOUTOUCOUFARA" },
              { code: "03", nom: "DIANKÉ MAKHA" },
              { code: "04", nom: "KOMOTI" }
            ]
          },
          {
            nom: "KOULOR",
            code: "04",
            communes: [
              { code: "01", nom: "KOULOR" },
              { code: "02", nom: "SINTHIOU BOCAR ALI" },
              { code: "03", nom: "KOTHIARY" }
            ]
          }
        ]
      },
      "KOUMPENTOUM": {
        nom: "Koumpentoum",
        code: "04",
        arrondissements: [
          {
            nom: "KOUMPENTOUM",
            code: "01",
            communes: [
              { code: "01", nom: "KOUMPENTOUM" }
            ]
          },
          {
            nom: "BAMBA THIALÈNE",
            code: "02",
            communes: [
              { code: "01", nom: "BAMBA THIALÈNE" },
              { code: "02", nom: "KAHÈNÉ" },
              { code: "03", nom: "MÉRÈTO" },
              { code: "04", nom: "N'DAME" }
            ]
          },
          {
            nom: "KOUTHIABA WOLOF",
            code: "03",
            communes: [
              { code: "01", nom: "KOUTHIA GAYDI" },
              { code: "02", nom: "KOUTHIABA WOLOF" },
              { code: "03", nom: "PASS KOTO" },
              { code: "04", nom: "PAYAR" },
              { code: "05", nom: "MALÈM NIANI" }
            ]
          }
        ]
      }
    }
  },

  "THIES": {
    nom: "Thiès",
    code: "13",
    departements: {
      "MBOUR": {
        nom: "Mbour",
        code: "01",
        arrondissements: [
          {
            nom: "FISSEL",
            code: "01",
            communes: [
              { code: "01", nom: "FISSEL" },
              { code: "02", nom: "N’DIAGANIAO" }
            ]
          },
          {
            nom: "SESSENE",
            code: "02",
            communes: [
              { code: "01", nom: "SANDIARA" },
              { code: "02", nom: "N’GUENIENE" },
              { code: "03", nom: "SESSENE" },
              { code: "04", nom: "THIADIAYE" }
            ]
          },
          {
            nom: "SINDIA",
            code: "03",
            communes: [
              { code: "01", nom: "MALICOUNDA" },
              { code: "02", nom: "DIASS" },
              { code: "03", nom: "SINDIA" },
              { code: "04", nom: "NGUEKOKH" },
              { code: "05", nom: "NGAPAROU" },
              { code: "06", nom: "POPENGUINE" },
              { code: "07", nom: "SALY PORTUDAL" },
              { code: "08", nom: "SOMONE" }
            ]
          },
          {
            nom: "MBOUR",
            code: "04",
            communes: [
              { code: "01", nom: "M’BOUR" }
            ]
          },
          {
            nom: "JOAL-FADIOUTH",
            code: "05",
            communes: [
              { code: "01", nom: "JOAL-FADIOUTH" }
            ]
          }
        ]
      },
      "THIES": {
        nom: "Thiès",
        code: "02",
        arrondissements: [
          {
            nom: "THIES NORD",
            code: "01",
            communes: [
              { code: "01", nom: "THIES NORD" }
            ]
          },
          {
            nom: "THIES SUD",
            code: "02",
            communes: [
              { code: "01", nom: "THIES EST" },
              { code: "02", nom: "THIES OUEST" }
            ]
          },
          {
            nom: "NOTTO",
            code: "03",
            communes: [
              { code: "01", nom: "NOTTO" },
              { code: "02", nom: "TASSETTE" }
            ]
          },
          {
            nom: "THIENABA",
            code: "04",
            communes: [
              { code: "01", nom: "N’DIEYENE SIRAKH" },
              { code: "02", nom: "N’GOUNDIANE" },
              { code: "03", nom: "THIENABA" },
              { code: "04", nom: "TOUBA TOUL" }
            ]
          },
          {
            nom: "KEUR MOUSSA",
            code: "05",
            communes: [
              { code: "01", nom: "KEUR MOUSSA" },
              { code: "02", nom: "FANDÈNE" },
              { code: "03", nom: "DIENDER GUEDJI" },
              { code: "04", nom: "CAYAR" }
            ]
          },
          {
            nom: "KHOMBOLE",
            code: "06",
            communes: [
              { code: "01", nom: "KHOMBOLE" }
            ]
          },
          {
            nom: "POUT",
            code: "07",
            communes: [
              { code: "01", nom: "POUT" }
            ]
          }
        ]
      },
      "TIVAOUANE": {
        nom: "Tivaouane",
        code: "03",
        arrondissements: [
          {
            nom: "TIVAOUANE",
            code: "01",
            communes: [
              { code: "01", nom: "TIVAOUANE" }
            ]
          },
          {
            nom: "MEKHE",
            code: "02",
            communes: [
              { code: "01", nom: "MEKHE" }
            ]
          },

          {
            nom: "MÉOUANE",
            code: "03",
            communes: [
              { code: "01", nom: "MÉOUANE" },
              { code: "02", nom: "TAÏBA N’DIAYE" },
              { code: "03", nom: "DAROU KHOUDOSS" },
              { code: "04", nom: "M’BORO" }
            ]
          },
          {
            nom: "MÉRINA-DAKHAR",
            code: "04",
            communes: [
              { code: "01", nom: "MÉRINA-DAKHAR" },
              { code: "02", nom: "KOUL" },
              { code: "03", nom: "PÉKÈSSE" }
            ]
          },
          {
            nom: "NIAKHÈNE",
            code: "05",
            communes: [
              { code: "01", nom: "NIAKHÈNE" },
              { code: "02", nom: "M’BAYÈNE" },
              { code: "03", nom: "N’GANDIOUF" },
              { code: "04", nom: "THILMAKHA" }
            ]
          },
          {
            nom: "PAMBAL",
            code: "06",
            communes: [
              { code: "01", nom: "PAMBAL" },
              { code: "02", nom: "NOTTO GOUYE DIAMA" },
              { code: "03", nom: "MONT‑ROLLAND" },
              { code: "04", nom: "CHÉRIF LÖ" },
              { code: "05", nom: "PIRE GOURÈYE" }
            ]
          }
        ]
      }
    }
  },

  "ZIGUINCHOR": {
    nom: "Ziguinchor",
    code: "14",
    departements: {
      "BIGNONA": {
        nom: "Bignona",
        code: "01",
        arrondissements: [
          {
            nom: "BIGNONA",
            code: "01",
            communes: [
              { code: "01", nom: "BIGNONA" }
            ]
          },
          {
            nom: "SINDIAN",
            code: "02",
            communes: [
              { code: "01", nom: "DJIBIDIONE" },
              { code: "02", nom: "OULAMPANE" },
              { code: "03", nom: "SINDIAN" },
              { code: "04", nom: "SUELLE" }
            ]
          },
          {
            nom: "TENDOUCK",
            code: "03",
            communes: [
              { code: "01", nom: "BALINGORE" },
              { code: "02", nom: "DIEGOUNE" },
              { code: "03", nom: "KARTHIACK" },
              { code: "04", nom: "MANGAGOULACK" },
              { code: "05", nom: "MLOMP" }
            ]
          },
          {
            nom: "TENGHORY",
            code: "04",
            communes: [
              { code: "01", nom: "COUBALAN" },
              { code: "02", nom: "NIAMONE" },
              { code: "03", nom: "OUONCK" },
              { code: "04", nom: "TENGHORY" }
            ]
          },
          {
            nom: "KATABA I",
            code: "05",
            communes: [
              { code: "01", nom: "DJINAKI" },
              { code: "02", nom: "KAFOUNTINE" },
              { code: "03", nom: "KATABA I" },
              { code: "04", nom: "DIOULOULOU" }
            ]
          },
          {
            nom: "THIONCK-ESSYL",
            code: "06",
            communes: [
              { code: "01", nom: "THIONCK-ESSYL" }
            ]
          }
        ]
      },
      "OUSSOUYE": {
        nom: "Oussouye",
        code: "02",
        arrondissements: [
          {
            nom: "OUSSOUYE",
            code: "01",
            communes: [
              { code: "01", nom: "OUSSOUYE" }
            ]
          },
          {
            nom: "CABROUSSE",
            code: "02",
            communes: [
              { code: "01", nom: "DJEMBERING" },
              { code: "02", nom: "SANTHIABA MANJACQUE" }
            ]
          },
          {
            nom: "LOUDIA OUOLOF",
            code: "03",
            communes: [
              { code: "01", nom: "MLOMP" },
              { code: "02", nom: "OUKOUT" }
            ]
          }
        ]
      },
      "ZIGUINCHOR": {
        nom: "Ziguinchor",
        code: "03",
        arrondissements: [
          {
            nom: "ZIGUINCHOR",
            code: "01",
            communes: [
              { code: "01", nom: "ZIGUINCHOR" }
            ]
          },
          {
            nom: "NIAGUIS",
            code: "02",
            communes: [
              { code: "01", nom: "ADEANE" },
              { code: "02", nom: "BOUTOUPA CAMARACOUNDA" },
              { code: "03", nom: "NIAGUIS" }
            ]
          },
          {
            nom: "NYASSIA",
            code: "03",
            communes: [
              { code: "01", nom: "ENAMPORE" },
              { code: "02", nom: "NYASSIA" }
            ]
          }
        ]
      }
    }
  },
  // Vous pouvez ajouter le reste des données si nécessaire
};

/**
 * @typedef {Object} Commune
 * @property {string} code
 * @property {string} nom
 */

/**
 * @typedef {Object} Arrondissement
 * @property {string} nom
 * @property {string} code
 * @property {Commune[]} communes
 */

/**
 * @typedef {Object} Departement
 * @property {string} nom
 * @property {string} code
 * @property {Arrondissement[]} arrondissements
 */

/**
 * @typedef {Object} Region
 * @property {string} nom
 * @property {string} code
 * @property {Object.<string, Departement>} departements
 */

/**
 * @typedef {Object.<string, Region>} SenegalData
 */

/**
 * Retourne un tableau de Map (une par département).
 * @param {SenegalData} data
 * @param {string|number} codeRegion
 * @returns {Map[]}
 */
function getDepartementsMapsByRegionCodeTS(codeRegion) {
  const regionCode = String(codeRegion).padStart(2, '0');
  const regionEntry = Object.values(SENEGAL_GEOGRAPHIC_DATA).find(r => r?.code === regionCode);
  if (!regionEntry?.departements) return [];

  return Object.entries(regionEntry.departements).map(([deptKey, deptVal]) => {
    return new Map([
      ['key', deptKey],
      ['code', deptVal.code],
      ['nom', deptVal.nom],
      ['arrondissements', deptVal.arrondissements ?? []],
    ]);
  });
}

// petit util pour comparer proprement les noms ("Dakar", "DAKAR", "dákàr" -> "DAKAR")
function normalizeLabel(s) {
  return String(s)
    .normalize('NFD')            // sépare les accents
    .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
    .replace(/[\s'-]+/g, '')     // retire espaces/traits d’union/apostrophes
    .toUpperCase();
}


/**
 * Retourne un tableau de Map pour chaque département d'une région, en entrant son NOM.
 * @param {object} data - l’objet des données (SENEGAL_GEOGRAPHIC_DATA)
 * @param {string} nomRegion - nom de la région (ex: "Dakar", "Diourbel")
 * @returns {Map<string, any>[]} - tableau de Map (une par département)
 */
function getDepartementsMapsByRegionName(nomRegion) {
  if (!nomRegion) return [];
  const target = normalizeLabel(nomRegion);

  // On autorise 2 façons de trouver la région :
  // 1) par "r.nom" (libellé humain)
  // 2) par la clé brute (DAKAR, DIOURBEL, ...), au cas où l'appelant passe déjà la clé
  let regionEntry = null;

  for (const [regionKey, regionVal] of Object.entries(SENEGAL_GEOGRAPHIC_DATA)) {
    const matchByLabel = normalizeLabel(regionVal?.nom) === target;
    const matchByKey   = normalizeLabel(regionKey) === target;
    if ((matchByLabel || matchByKey) && regionVal?.departements) {
      regionEntry = regionVal;
      break;
    }
  }

  if (!regionEntry) return [];

  return Object.entries(regionEntry.departements).map(([deptKey, deptVal]) => {
    return new Map([
      ['key', deptKey],                          // ex: "PIKINE"
      ['code', deptVal.code],                    // ex: "02"
      ['nom', deptVal.nom],                      // ex: "Pikine"
      ['arrondissements', deptVal.arrondissements || []],
    ]);
  });
}


/**
 * Récupère les informations géographiques détaillées à partir des codes
 * @param {string} codeRegion - Code de la région
 * @param {string} codeDepartement - Code du département
 * @param {string} codeArrondissement - Code de l'arrondissement
 * @param {string} codeCommune - Code de la commune
 * @returns {Object} - Informations géographiques détaillées
 */
function getLocationDetails(codeRegion, codeDepartement, codeArrondissement, codeCommune) {
  try {
    const result = {
      region: null,
      departement: null,
      arrondissement: null,
      commune: null
    };
    

    console.log('Récupération des détails géographiques:', {
      codeRegion,
      codeDepartement,
      codeArrondissement,
      codeCommune
    });

    if (!codeRegion) return result;

    console.log('Récupération des détails géographiques pour la région:', codeRegion);

    // Parcourir les régions
    for (const regionKey in SENEGAL_GEOGRAPHIC_DATA) {
      const region = SENEGAL_GEOGRAPHIC_DATA[regionKey];
      // console.log('Récupération des détails géographiques pour la région:', region.nom);

     // console.log('Comparaison des codes:', region.code, region.departements);

      if (region.code === codeRegion) {
        result.region = region.nom;
        console.log('Région trouvée:', region.nom);
        if (!codeDepartement) break;
        
        // Parcourir les départements
        for (const deptKey in region.departements) {
          const dept = region.departements[deptKey];
          
          if (dept.code === codeDepartement) {
            result.departement = dept.nom;

            console.log('Département trouvé:', dept.nom);
            
            if (!codeArrondissement) break;
            
            // Parcourir les arrondissements
            let arrondissementTrouve = false;
            for (const arrondKey in dept.arrondissements) {
              const arrond = dept.arrondissements[arrondKey];
              if (arrond.code === codeArrondissement) {
                console.log('Arrondissement trouvé:', arrond.nom);
                result.arrondissement = arrond.nom;
                arrondissementTrouve = true;
                
                if (!codeCommune) break;
                
                // Parcourir les communes
                let communeTrouvee = false;
                for (const communeKey in arrond.communes) {
                  const commune = arrond.communes[communeKey];
                  if (commune.code === codeCommune) {
                    console.log('Commune trouvée:', commune.nom);
                    result.commune = commune.nom;
                    communeTrouvee = true;
                    break;
                  }
                }
                
                break;
              }
            }
            
            break;
          }
        }
        break;
      }
    }

    console.log('Détails géographiques récupérés:', result);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails géographiques:', error);
    return {
      region: null,
      departement: null,
      arrondissement: null,
      commune: null
    };
  }
};

/**
 * Retourne la liste de tous les départements du Sénégal sous forme d'un tableau d'objets
 * Chaque objet contient le code et le nom du département
 * @returns {Array<{code: string, nom: string, region: string, regionCode: string}>} Liste des départements
 */
const getDepartements = () => {
  const departements = [];
  
  // Parcourir toutes les régions et leurs départements
  Object.entries(SENEGAL_GEOGRAPHIC_DATA).forEach(([regionKey, regionData]) => {
    // Pour chaque région, parcourir ses départements
    Object.entries(regionData.departements).forEach(([deptKey, deptData]) => {
      departements.push({
        code: deptData.code,
        nom: deptData.nom,
        region: regionData.nom,
        regionCode: regionData.code
      });
    });
  });
  
  // Trier les départements par nom
  departements.sort((a, b) => a.nom.localeCompare(b.nom));
  
  return departements;
};

const getDepartementByCodeRegion = (code) => {
  const departements = getDepartements();
  return departements.find(dept => dept.regionCode === code);
};

/**
 * Retourne la liste des départements pour une région spécifique
 * @param {string} regionCode - Code de la région (optionnel)
 * @returns {Array<{code: string, nom: string, region: string, regionCode: string}>} Liste des départements de la région
 */
const getDepartementsByRegion = (regionCode = null) => {
  const departements = getDepartements();

  console.log('Récupération des départements pour la région:', regionCode);

//  console.log('Liste complète des départements:', departements);
  
  if (regionCode) {
    // Filtrer les départements pour une région spécifique
    return departements.filter(dept => dept.regionCode === regionCode);
  } else {
    // Si aucun code de région n'est fourni, retourner tous les départements groupés par région
    const departementsByRegion = {};
    
    departements.forEach(dept => {
      const region = dept.regionCode;
      
      if (!departementsByRegion[region]) {
        departementsByRegion[region] = [];
      }
      
      departementsByRegion[region].push({
        code: dept.code,
        nom: dept.nom
      });
    });

    console.log('Départements groupés par région:', departementsByRegion);
    
    return departementsByRegion;
  }
};

/**
 * Récupère le nom d'un arrondissement par ses codes
 * @param {string} codeRegion - Code de la région
 * @param {string} codeDepartement - Code du département  
 * @param {string} codeArrondissement - Code de l'arrondissement
 * @returns {string|null} Le nom de l'arrondissement ou null si non trouvé
 */
const getArrondissement = (codeRegion, codeDepartement, codeArrondissement) => {
  try {
    // Parcourir les régions pour trouver celle avec le code correspondant
    for (const regionKey in SENEGAL_GEOGRAPHIC_DATA) {
      const region = SENEGAL_GEOGRAPHIC_DATA[regionKey];
      
      if (region.code === codeRegion) {
        // Chercher le département dans cette région
        for (const departementKey in region.departements) {
          const departement = region.departements[departementKey];
          
          if (departement.code === codeDepartement) {
            // Chercher l'arrondissement dans ce département
            const arrondissement = departement.arrondissements.find(arr => arr.code === codeArrondissement);
            
            if (arrondissement) {
              return arrondissement.nom;
            }
          }
        }
      }
    }
    
    console.warn(`Arrondissement non trouvé: région ${codeRegion}, département ${codeDepartement}, arrondissement ${codeArrondissement}`);
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'arrondissement:', error);
    return null;
  }
};

/**
 * Récupère le nom d'une commune par ses codes
 * @param {string} codeRegion - Code de la région
 * @param {string} codeDepartement - Code du département
 * @param {string} codeArrondissement - Code de l'arrondissement
 * @param {string} codeCommune - Code de la commune
 * @returns {string|null} Le nom de la commune ou null si non trouvé
 */
const getCommune = (codeRegion, codeDepartement, codeArrondissement, codeCommune) => {
  try {
    // Parcourir les régions pour trouver celle avec le code correspondant
    for (const regionKey in SENEGAL_GEOGRAPHIC_DATA) {
      const region = SENEGAL_GEOGRAPHIC_DATA[regionKey];
      
      if (region.code === codeRegion) {
        // Chercher le département dans cette région
        for (const departementKey in region.departements) {
          const departement = region.departements[departementKey];
          
          if (departement.code === codeDepartement) {
            // Chercher l'arrondissement dans ce département
            const arrondissement = departement.arrondissements.find(arr => arr.code === codeArrondissement);
            
            if (arrondissement) {
              // Chercher la commune dans cet arrondissement
              const commune = arrondissement.communes.find(comm => comm.code === codeCommune);
              
              if (commune) {
                return commune.nom;
              }
            }
          }
        }
      }
    }
    
    console.warn(`Commune non trouvée: région ${codeRegion}, département ${codeDepartement}, arrondissement ${codeArrondissement}, commune ${codeCommune}`);
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de la commune:', error);
    return null;
  }
};

/**
 * Récupère le nom d'une région par son code
 * @param {string} codeRegion - Code de la région (ex: "01")
 * @returns {string|null} Le nom de la région (ex: "DAKAR") ou null si non trouvé
 */
const getRegionNameByCode = (codeRegion) => {
  try {
    // Parcourir les régions pour trouver celle avec le code correspondant
    for (const regionKey in SENEGAL_GEOGRAPHIC_DATA) {
      const region = SENEGAL_GEOGRAPHIC_DATA[regionKey];
      
      if (region.code === codeRegion) {
        return regionKey; // Retourner la clé qui est le nom de la région
      }
    }
    
    console.warn(`Région non trouvée pour le code: ${codeRegion}`);
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de la région:', error);
    return null;
  }
};

// Exporter les fonctions et données
module.exports = {
  SENEGAL_GEOGRAPHIC_DATA,
  getDepartementByCodeRegion,
  getDepartements,
  getDepartementsByRegion,
  getDepartementsMapsByRegionCodeTS,
  getDepartementsMapsByRegionName,
  getArrondissement,
  getCommune,
  getRegionNameByCode,
  getLocationDetails
};