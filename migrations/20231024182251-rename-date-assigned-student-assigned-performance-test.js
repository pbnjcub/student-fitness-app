'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_assigned_performance_test', 'date_assigned', 'dateAssigned');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_assigned_performance_test', 'dateAssigned', 'date_assigned');
  }
};
