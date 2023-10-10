const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AdminDetail extends Model { }

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
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, { sequelize, modelName: 'AdminDetail', tableName: 'admin_details' });

  return AdminDetail;
};
