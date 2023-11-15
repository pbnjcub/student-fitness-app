const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SectionEnrollment extends Model { }

    SectionEnrollment.init({
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'modules',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        teacherUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        enrollmentBeginDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        enrollmentEndDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    }, { 
        sequelize, 
        modelName: 'SectionEnrollment', 
        tableName: 'section_enrollments',
    });

    return SectionEnrollment;
};
