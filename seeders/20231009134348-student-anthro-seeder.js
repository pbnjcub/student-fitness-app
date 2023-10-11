'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_anthros', [
      {
        teacherUserId: 1,
        studentUserId: 3,
        date_recorded: new Date(), // This will insert the current date
        height: 195, // Replace 170 with the desired height for user with ID 3
        weight: 65, // Replace 65 with the desired weight for user with ID 3
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        teacherUserId: 2,
        studentUserId: 4,
        date_recorded: new Date(), // This will insert the current date
        height: 175, // Replace 175 with the desired height for user with ID 4
        weight: 50, // Replace 70 with the desired weight for user with ID 4
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('student_anthros', null, {});
  }
};
