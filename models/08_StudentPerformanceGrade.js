const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class StudentPerformanceGrade extends Model { }

    StudentPerformanceGrade.init({
        assignedPerformanceTestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'student_assigned_performance_test',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        dateTaken: {
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
        timestamps: false,
    });

    return StudentPerformanceGrade;
};
