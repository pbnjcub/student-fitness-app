'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the foreign key constraint on originalAnthroId
    await queryInterface.removeConstraint('student_hist_anthros', 'student_hist_anthros_originalAnthroId_fkey');
    
    // Optionally change the column to a regular integer if it's still defined as a foreign key in Sequelize model
    await queryInterface.changeColumn('student_hist_anthros', 'originalAnthroId', {
      type: Sequelize.INTEGER,
      allowNull: false // adjust this according to your needs
    });
  },

  down: async (queryInterface, Sequelize) => {
    // To revert, add the foreign key constraint back (optional, only if needed for rollback purposes)
    await queryInterface.addConstraint('student_hist_anthros', {
      fields: ['originalAnthroId'],
      type: 'foreign key',
      name: 'student_hist_anthros_originalAnthroId_fkey',
      references: {
        table: 'student_anthros',
        field: 'id'
      },
      onDelete: 'SET NULL', // or 'CASCADE', depending on original design
      onUpdate: 'CASCADE'
    });
  }
};
