'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_performance_grades_history', 'date_taken', 'dateTaken');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_performance_grades_history', 'dateTaken', 'date_taken');
  }
};
