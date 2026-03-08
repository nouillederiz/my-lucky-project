# Utiliser une image Node.js complète
FROM node:20

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances proprement
RUN npm ci || npm install

# Copier tout le code source
COPY . .

# Construire le frontend
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Démarrer l'application avec Node.js classique
CMD ["node", "dist/server.js"]
