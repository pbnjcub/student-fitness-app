module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'student_performance_grades_history', // name of the table
      'assignedPerformanceTestId', // name of the new column
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_assigned_performance_test', // name of the referenced table
          key: 'id', // key in the referenced table
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'student_performance_grades_history',
      'assignedPerformanceTestId'
    );
  },
};
