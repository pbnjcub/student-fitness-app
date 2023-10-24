'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_hist_anthros', 'date_recorded', 'dateRecorded');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_hist_anthros', 'dateRecorded', 'date_recorded');
  }
};
