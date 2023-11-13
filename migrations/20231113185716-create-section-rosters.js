'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('section_rosters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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

    await queryInterface.addIndex('section_rosters', ['studentUserId']);

    await queryInterface.addIndex('section_rosters', ['sectionId']);

    await queryInterface.addConstraint('section_rosters', {
      fields: ['studentUserId', 'sectionId'],
      type: 'unique',
      name: 'section_rosters_studentUserId_sectionId_unique_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('section_rosters', 'section_rosters_studentUserId_sectionId_unique_constraint');

    // Remove the indexes
    await queryInterface.removeIndex('section_rosters', 'section_rosters_studentUserId_idx'); // replace with actual index name if different
    await queryInterface.removeIndex('section_rosters', 'section_rosters_sectionId_idx'); // replace with actual index name if different

    await queryInterface.dropTable('section_rosters');
  }
};
