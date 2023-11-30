module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'sections', // name of the table
      'isActive', // name of the new column
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'sections',
      'isActive'
    );
  },
};
