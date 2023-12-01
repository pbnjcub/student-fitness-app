const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class StudentPerformanceType extends Model { }

    StudentPerformanceType.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'StudentPerformanceType',
        tableName: 'student_performance_types',
        timestamps: false,
    });

    return StudentPerformanceType;
};
