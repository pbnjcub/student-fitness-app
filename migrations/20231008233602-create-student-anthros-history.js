'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_anthros_history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentAnthrosId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_anthros',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY, // Use DATEONLY if you only want to store the date without time.
        allowNull: false,
        defaultValue: Sequelize.fn('NOW') // Default value set to today's date.
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_anthros_history'); // Drop this first due to the foreign key constraint.
    // await queryInterface.dropTable('users');
  }
};
