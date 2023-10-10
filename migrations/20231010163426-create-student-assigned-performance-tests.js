'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_assigned_performance_tests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      performanceTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_performance_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      teacherUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      studentUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_assigned: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW') // If you want it to default to current time on creation.
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW') // If you want it to default to current time on update.
      },
    });

    // Add the unique constraint on performanceTypeId and userId.
    await queryInterface.addConstraint('student_assigned_performance_tests', {
      fields: ['performanceTypeId', 'studentUserId'],
      type: 'unique',
      name: 'unique_performanceTypeId_studentUserId'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint during the rollback
    await queryInterface.removeConstraint('student_assigned_performance_tests', 'unique_performanceTypeId_studentUserId');

    await queryInterface.dropTable('student_assigned_performance_tests');
  }
};
