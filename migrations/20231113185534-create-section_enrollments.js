'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('section_enrollments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sectionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sections',
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

    await queryInterface.addIndex('section_enrollments', ['moduleId']);

    await queryInterface.addIndex('section_enrollments', ['sectionId']);

    await queryInterface.addConstraint('section_enrollments', {
      fields: ['moduleId', 'sectionId'],
      type: 'unique',
      name: 'section_enrollments_moduleId_sectionId_unique_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('section_enrollments', 'section_enrollments_moduleId_sectionId_unique_constraint');

    // Remove the indexes
    await queryInterface.removeIndex('section_enrollments', 'moduleId'); // replace with actual index name if different
    await queryInterface.removeIndex('section_enrollments', 'sectionId'); // replace with actual index name if different

    // Drop the table
    await queryInterface.dropTable('section_enrollments');
  }
};
