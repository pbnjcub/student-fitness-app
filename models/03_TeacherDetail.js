const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TeacherDetail extends Model { }

  TeacherDetail.init({
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
    yearsExp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, { sequelize, modelName: 'TeacherDetail', tableName: 'teacher_details' });

  return TeacherDetail;
};
