'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_performance_grades', [
      {
        performanceTypeId: 1,
        teacherUserId: 1,
        studentUserId: 3,
        date_taken: new Date(),
        grade: 5.5,
        comment: 'Good job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        performanceTypeId: 2,
        teacherUserId: 2,
        studentUserId: 3,
        date_taken: new Date(),
        grade: 600,
        comment: 'Great job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        performanceTypeId: 3,
        teacherUserId: 1,
        studentUserId: 3,
        date_taken: new Date(),
        grade: 25,
        comment: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        performanceTypeId: 1,
        teacherUserId: 1,
        studentUserId: 4,
        date_taken: new Date(),
        grade: 6.2,
        comment: 'Good job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        performanceTypeId: 2,
        teacherUserId: 2,
        studentUserId: 4,
        date_taken: new Date(),
        grade: 500,
        comment: 'Great job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        performanceTypeId: 3,
        teacherUserId: 2,
        studentUserId: 4,
        date_taken: new Date(),
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
