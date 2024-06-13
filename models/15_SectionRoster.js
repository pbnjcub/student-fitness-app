const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SectionRoster extends Model { }

    SectionRoster.init({
        studentUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE' // No change needed here
        },
        sectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sections',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT' // Change from CASCADE to RESTRICT
        },
    }, { 
        sequelize, 
        modelName: 'SectionRoster', 
        tableName: 'section_rosters',
    });

    return SectionRoster;
};
