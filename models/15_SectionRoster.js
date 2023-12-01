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
            onDelete: 'CASCADE'
        },
        sectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sections',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
    }, { 
        sequelize, 
        modelName: 'SectionRoster', 
        tableName: 'section_rosters',
        timestamps: false,
    });

    return SectionRoster;
};
