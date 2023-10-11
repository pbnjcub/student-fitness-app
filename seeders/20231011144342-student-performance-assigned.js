'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_assigned_performance_test', [
      {
        performanceTypeId: 1,
        teacherUserId: 1,
        studentUserId: 3,
        date_assigned: new Date(),
      },
      {
        performanceTypeId: 2,
        teacherUserId: 2,
        studentUserId: 3,
        date_assigned: new Date(),
      },
      {
        performanceTypeId: 3,
        teacherUserId: 1,
        studentUserId: 3,
        date_assigned: new Date(),
      },
      {
        performanceTypeId: 1,
        teacherUserId: 1,
        studentUserId: 4,
        date_assigned: new Date(),
      },
      {
        performanceTypeId: 2,
        teacherUserId: 2,
        studentUserId: 4,
        date_assigned: new Date(),
      },
      {
        performanceTypeId: 3,
        teacherUserId: 2,
        studentUserId: 4,
        date_assigned: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('student_assigned_performance_test', null, {});
  }
};
