# Utiliser l'image officielle Node.js LTS
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copier le code source
COPY --chown=nextjs:nodejs . .

# Créer les dossiers nécessaires
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app/logs

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port de l'application
EXPOSE 5000

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de santé pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Commande de démarrage
CMD ["npm", "start"]
