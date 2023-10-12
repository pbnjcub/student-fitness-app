const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StudentAnthro extends Model { }

  StudentAnthro.init({
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
    date_recorded: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW // Sets the default value to the current date
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, { sequelize, modelName: 'StudentAnthro', tableName: 'student_anthros' });

  return StudentAnthro;
};
