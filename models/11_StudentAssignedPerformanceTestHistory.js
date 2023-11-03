const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class StudentAssignedPerformanceTestHistory extends Model { }

    StudentAssignedPerformanceTestHistory.init({
        originalPerformanceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'student_assigned_performance_test',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
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
            allowNull: true,
        },
    }, { 
        sequelize, 
        modelName: 'StudentAssignedPerformanceTestHistory', 
        tableName: 'assigned_hist_performances',
    });

    return StudentAssignedPerformanceTestHistory;
};
