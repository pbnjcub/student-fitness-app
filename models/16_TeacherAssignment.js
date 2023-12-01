const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class TeacherAssignment extends Model { }

    TeacherAssignment.init({
        sectionEnrollmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'section_enrollments',
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
    }, { 
        sequelize, 
        modelName: 'TeacherAssignment', 
        tableName: 'teacher_assignments',
        timestamps: false,
    });

    return TeacherAssignment;
};
