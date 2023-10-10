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
        date_assigned: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    }, { 
        sequelize, 
        modelName: 'StudentAssignedPerformanceTest', 
        tableName: 'student_performance_grades',
        indexes: [
            {
                unique: true,
                fields: ['performanceTypeId', 'studentUserId']
            }
        ]
    });

    return StudentAssignedPerformanceTest;
};
