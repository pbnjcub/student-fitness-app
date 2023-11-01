'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('student_performance_grades_history', 'performanceTypeId');
    await queryInterface.removeColumn('student_performance_grades_history', 'studentUserId');
    await queryInterface.removeColumn('student_performance_grades_history', 'teacherUserId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('student_performance_grades_history', 'performanceTypeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('student_performance_grades_history', 'studentUserId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('student_performance_grades_history', 'teacherUserId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
