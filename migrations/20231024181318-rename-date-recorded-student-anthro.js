'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_anthros', 'date_recorded', 'dateRecorded');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('student_anthros', 'dateRecorded', 'date_recorded');
  }
};
