const express = require('express');
const router = express.Router();
const { utilisateur } = require('../../models');

// Exemple : récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await utilisateur.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Exemple : créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const { email, mot_de_passe, nom_utilisateur } = req.body;
    const user = await utilisateur.create({
      email,
      mot_de_passe,
      nom_utilisateur,
      date_creation: new Date(),
      date_mise_a_jour: new Date()
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création' });
  }
});

// À exporter pour utilisation dans server.js
module.exports = router;