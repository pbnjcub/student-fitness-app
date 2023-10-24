'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('StudentAnthros', 'date_recorded', 'dateRecorded');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('StudentAnthros', 'dateRecorded', 'date_recorded');
  }
};
