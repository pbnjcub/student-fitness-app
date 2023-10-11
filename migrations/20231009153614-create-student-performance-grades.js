'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_performance_grades', {
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
      date_taken: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      grade: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
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
    await queryInterface.addConstraint('student_performance_grades', {
      fields: ['performanceTypeId', 'studentUserId'],
      type: 'unique',
      name: 'unique_constraint_grades'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint during the rollback
    await queryInterface.removeConstraint('student_performance_grades', 'unique_constraint_grades');

    await queryInterface.dropTable('student_performance_grades');
  }
};
