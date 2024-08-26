const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class StudentAssignedPerformanceTest extends Model { }

    StudentAssignedPerformanceTest.init({
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
        dateAssigned: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    }, { 
        sequelize, 
        modelName: 'StudentAssignedPerformanceTest', 
        tableName: 'student_assigned_performance_test',
        indexes: [
            {
                unique: true,
                fields: ['performanceTypeId', 'studentUserId']
            }
        ]
    });

    return StudentAssignedPerformanceTest;
};
