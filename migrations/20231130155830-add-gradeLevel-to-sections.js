module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'sections', // Name of the table
      'gradeLevel', // Name of the new column
      {
        type: Sequelize.ENUM('6', '7', '8', '9', '10-11-12'), // ENUM type with your grade levels
        allowNull: false,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sections', 'gradeLevel');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_sections_gradeLevel"');
  },
};

