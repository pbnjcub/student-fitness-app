const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StudentDetail extends Model {}

  StudentDetail.init({
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
    gradYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, { sequelize, modelName: 'StudentDetail', tableName: 'student_details' });

  return StudentDetail;
};
