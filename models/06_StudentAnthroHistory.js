const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StudentAnthroHistory extends Model {}

  StudentAnthroHistory.init({
    studentAnthroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student_anthro', // Name of the table for StudentAnthro
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW // Sets the default value to the current date
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, { sequelize, modelName: 'StudentAnthroHistory', tableName: 'student_anthro_history' });

  return StudentAnthroHistory;
};
