'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('student_assigned_performance_test', 'dateAssigned', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.NOW // Optional: Set a default value if necessary
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('student_assigned_performance_test', 'dateAssigned', {
      type: Sequelize.DATEONLY,
      allowNull: true // Revert to nullable
    });
  }
};
