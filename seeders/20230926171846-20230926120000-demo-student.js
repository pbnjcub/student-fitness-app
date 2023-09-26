'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('students', [
      {
        name: 'John Doe',
        birthDate: new Date('1995-05-15'),
        gradYear: 2023,
        weight: 70,
        height: 175,
        photo: 'https://picsum.photos/200/300',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('students', null, {});
  },
};
