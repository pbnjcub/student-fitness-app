'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_performance_grades', [
      {
        assignedPerformanceTestId: 13,
        dateTaken: new Date(),
        grade: 5.5,
        comment: 'Good job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        assignedPerformanceTestId: 14,
        dateTaken: new Date(),
        grade: 600,
        comment: 'Great job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        assignedPerformanceTestId: 15,
        dateTaken: new Date(),
        grade: 25,
        comment: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        assignedPerformanceTestId: 16,
        dateTaken: new Date(),
        grade: 6.2,
        comment: 'Good job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        assignedPerformanceTestId: 17,
        dateTaken: new Date(),
        grade: 500,
        comment: 'Great job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        assignedPerformanceTestId: 18,
        dateTaken: new Date(),
        grade: 18,
        comment: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('student_performance_grades', null, {});
  }
};
