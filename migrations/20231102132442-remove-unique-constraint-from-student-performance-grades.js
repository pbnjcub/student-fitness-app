'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('student_performance_grades', 'unique_constraint_grades');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('student_performance_grades', {
      fields: ['performanceTypeId', 'studentUserId'],
      type: 'unique',
      name: 'unique_constraint_grades'
    });
  }
};
