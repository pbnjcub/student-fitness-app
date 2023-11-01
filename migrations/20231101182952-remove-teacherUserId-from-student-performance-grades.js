'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('student_performance_grades', 'teacherUserId');
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('student_performance_grades', 'teacherUserId', {
      type: Sequelize.INTEGER
      // If there are other options for the column, add them here
    });
  }
};
