'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class utilisateur extends Model {
    static associate(models) {
      // Associations à définir ici plus tard
    }
  }
  utilisateur.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nom_utilisateur: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    date_mise_a_jour: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'utilisateur',
    tableName: 'utilisateurs',
    timestamps: false
  });
  return utilisateur;
};