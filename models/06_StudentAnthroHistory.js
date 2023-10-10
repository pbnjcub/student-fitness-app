const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StudentHistAnthro extends Model { }

  StudentHistAnthro.init({
    originalAnthroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student_anthros', // Name of the table for StudentAnthro
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    teacherUserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    studentUserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date_recorded: {
      type: Sequelize.DATEONLY, // Use DATEONLY if you only want to store the date without time.
      allowNull: false,
      defaultValue: Sequelize.fn('NOW') // Default value set to today's date.
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, { sequelize, modelName: 'StudentHistAnthro', tableName: 'student_hist_anthros' });

  return StudentHistAnthro;
};
