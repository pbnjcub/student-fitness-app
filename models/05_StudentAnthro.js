const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StudentAnthro extends Model {}

  StudentAnthro.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
  }, { sequelize, modelName: 'StudentAnthro', tableName: 'student_anthros' });

  return StudentAnthro;
};
