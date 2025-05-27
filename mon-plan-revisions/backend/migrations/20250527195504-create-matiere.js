'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matieres', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      heures_revision: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date_examen: {
        type: Sequelize.DATE,
        allowNull: false
      },
      type_examen: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      duree_examen: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date_creation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      date_mise_a_jour: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('matieres');
  }
};