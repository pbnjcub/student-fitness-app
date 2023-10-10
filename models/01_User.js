const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model { }

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
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    genderIdentity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pronouns: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userType: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.STRING, // Assuming the URL or path is a string.
      allowNull: true
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    dateArchived: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, { sequelize, modelName: 'User', tableName: 'users' });

  console.log("Inside User model file");

  return User;
};
