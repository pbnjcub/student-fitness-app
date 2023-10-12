const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class StudentPerformanceGrade extends Model { }

    StudentPerformanceGrade.init({
        performanceTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'student_performance_types',
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
        date_taken: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW // Sets the default value to the current date
        },
        grade: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, { 
        sequelize, 
        modelName: 'StudentPerformanceGrade', 
        tableName: 'student_performance_grades',
        indexes: [
            {
                unique: true,
                fields: ['performanceTypeId', 'studentUserId']
            }
        ]
    });

    return StudentPerformanceGrade;
};
