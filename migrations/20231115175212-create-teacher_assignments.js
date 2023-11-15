'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher_assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sectionEnrollmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'section_enrollments',
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('teacher_assignments', ['teacherUserId']);

    await queryInterface.addIndex('teacher_assignments', ['sectionEnrollmentId']);
  },

  async down(queryInterface, Sequelize) {
  
    // Remove the indexes
    await queryInterface.removeIndex('teacher_assignments', 'teacherUserId'); 
    await queryInterface.removeIndex('teacher_assignments', 'sectionEnrollmentId'); 

    await queryInterface.dropTable('teacher_assignments');
  }
};
