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
      enrollmentBeginDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      enrollmentEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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

    await queryInterface.addConstraint('section_enrollments', {
      fields: ['enrollmentBeginDate', 'enrollmentEndDate'],
      type: 'check',
      name: 'enrollment_dates_validity_check',
      where: {
        enrollmentEndDate: {
          [Sequelize.Op.gte]: Sequelize.col('enrollmentBeginDate')
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeConstraint('section_enrollments', 'enrollment_dates_validity_check');

    // Remove the unique constraint
    await queryInterface.removeConstraint('section_enrollments', 'section_enrollments_moduleId_sectionId_unique_constraint');

    // Remove the indexes
    await queryInterface.removeIndex('section_enrollments', 'moduleId'); // replace with actual index name if different
    await queryInterface.removeIndex('section_enrollments', 'sectionId'); // replace with actual index name if different

    // Drop the table
    await queryInterface.dropTable('section_enrollments');
  }
};
