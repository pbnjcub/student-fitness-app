'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('student_performance_types', [
      {
        name: "40 Yard Dash",
        description: "The 40-yard dash is a sprint covering 40 yards (36.58 m). It is primarily run to evaluate the speed and acceleration of American football players by scouts, particularly for the NFL Draft but also for collegiate recruiting.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mile Run",
        description: "Timed mile run.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Push Ups",
        description: "Push ups.",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('student_performance_types', null, {});

    await queryInterface.sequelize.query('ALTER SEQUENCE student_performance_types_id_seq RESTART WITH 1');

  }
};
