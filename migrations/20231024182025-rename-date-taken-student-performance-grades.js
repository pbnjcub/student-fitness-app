'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_performance_grades', 'date_taken', 'dateTaken');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_performance_grades', 'dateTaken', 'date_taken');
  }
};
