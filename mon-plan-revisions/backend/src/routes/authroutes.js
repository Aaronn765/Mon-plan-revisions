const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { utilisateur } = require('../../models');
const router = express.Router();

const SECRET = 'yegyb'; // À mettre dans .env en prod

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, mot_de_passe, nom_utilisateur } = req.body;
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const user = await utilisateur.create({
      email,
      mot_de_passe: hash,
      nom_utilisateur,
      date_creation: new Date(),
      date_mise_a_jour: new Date()
    });
    res.status(201).json({ message: 'Utilisateur créé', user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await utilisateur.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// Logout (côté API, il suffit de supprimer le token côté client)
router.post('/logout', (req, res) => {
  // En JWT stateless, le logout se fait côté client (suppression du token)
  res.json({ message: 'Déconnexion réussie (supprimez le token côté client)' });
});

module.exports = router;