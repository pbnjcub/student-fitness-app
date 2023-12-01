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
    dateRecorded: {
      type: DataTypes.DATEONLY, // Use DATEONLY if you only want to store the date without time.
      allowNull: false,
      defaultValue: DataTypes.NOW  // Default value set to today's date.
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'StudentHistAnthro',
    tableName: 'student_hist_anthros',
    timestamps: false,
  });

  return StudentHistAnthro;
};
