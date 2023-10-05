const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TeacherDetail extends Model {}

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
      allowNull: false
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, { sequelize, modelName: 'TeacherDetail', tableName: 'teacher_details' });

  return TeacherDetail;
};
