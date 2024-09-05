'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('student_hist_anthros', 'student_hist_anthros_originalAnthroId_fkey');
    await queryInterface.addConstraint('student_hist_anthros', {
      fields: ['originalAnthroId'],
      type: 'foreign key',
      name: 'student_hist_anthros_originalAnthroId_fkey',
      references: {
        table: 'student_anthros',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('student_hist_anthros', 'student_hist_anthros_originalAnthroId_fkey');
    await queryInterface.addConstraint('student_hist_anthros', {
      fields: ['originalAnthroId'],
      type: 'foreign key',
      name: 'student_hist_anthros_originalAnthroId_fkey',
      references: {
        table: 'student_anthros',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'  // Restore the original behavior if needed
    });
  }
};
