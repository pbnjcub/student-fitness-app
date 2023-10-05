const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AdminDetail extends Model {}

  AdminDetail.init({
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
  }, { sequelize, modelName: 'AdminDetail', tableName: 'admin_details' });

  return AdminDetail;
};
