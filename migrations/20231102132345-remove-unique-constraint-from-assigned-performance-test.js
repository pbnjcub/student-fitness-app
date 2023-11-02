'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('student_assigned_performance_test', 'unique_constraint_assigned');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('student_assigned_performance_test', {
      fields: ['performanceTypeId', 'studentUserId'],
      type: 'unique',
      name: 'unique_constraint_assigned'
    });
  }
};
