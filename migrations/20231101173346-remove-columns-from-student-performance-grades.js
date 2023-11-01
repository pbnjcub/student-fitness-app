'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('student_performance_grades', 'performanceTypeId');
    await queryInterface.removeColumn('student_performance_grades', 'studentUserId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('student_performance_grades', 'performanceTypeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('student_performance_grades', 'studentUserId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
