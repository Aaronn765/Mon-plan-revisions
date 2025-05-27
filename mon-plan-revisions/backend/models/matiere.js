'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class matiere extends Model {
    static associate(models) {
      matiere.belongsTo(models.utilisateur, { foreignKey: 'utilisateur_id' });
    }
  }
  matiere.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    utilisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    heures_revision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_examen: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type_examen: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    duree_examen: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelName: 'matiere',
    tableName: 'matieres',
    timestamps: false
  });
  return matiere;
};