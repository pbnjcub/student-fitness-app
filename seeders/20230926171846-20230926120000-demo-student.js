'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('students', [
      {
        lastName: 'Doe',
        firstName: 'John',
        birthDate: new Date('1995-05-15'),
        gradYear: 2023,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lastName: 'Johnson',
        firstName: 'Jane',
        birthDate: new Date('1995-05-16'),
        gradYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('students', null, {});
  },
};
