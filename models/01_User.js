const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },      
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 128], // Example: Minimum of 6 characters
            msg: "Password must be between 6 and 128 characters",
          },
        },
      },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    genderIdentity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pronouns: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      allowNull: false
    }
  }, { sequelize, modelName: 'User', tableName: 'users' });

  console.log("Inside User model file");

  return User;
};
