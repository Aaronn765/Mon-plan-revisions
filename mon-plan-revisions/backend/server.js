const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Import de l'instance Sequelize et des modèles
const db = require('./models');

// Import des routes utilisateurs
const userRoutes = require('./src/routes/userRoutes');

// Middleware pour parser le JSON
app.use(express.json());

// Utilisation des routes
app.use('/api/utilisateurs', userRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API en ligne !');
});

// Connexion à la base de données puis lancement du serveur
db.sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données réussie');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur de connexion à la base de données :', err);
  });