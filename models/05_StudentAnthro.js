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
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, { sequelize, modelName: 'StudentAnthro', tableName: 'student_anthro' });

  return StudentAnthro;
};
