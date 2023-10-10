'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_performance_grades', [
      {
        performanceTypeId: 1,
        userId: 3,
        date: new Date(),
        grade: 5.5,
      },
      {
        performanceTypeId: 2,
        userId: 3,
        date: new Date(),
        grade: 600,
      },
      {
        performanceTypeId: 3,
        userId: 3,
        date: new Date(),
        grade: 25,
      },
      {
        performanceTypeId: 1,
        userId: 4,
        date: new Date(),
        grade: 6.2,
      },
      {
        performanceTypeId: 2,
        userId: 4,
        date: new Date(),
        grade: 500,
      },
      {
        performanceTypeId: 3,
        userId: 4,
        date: new Date(),
        grade: 18,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('student_performance_grades', null, {});
  }
};
