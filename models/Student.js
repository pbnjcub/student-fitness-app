// Importing Model and DataTypes from 'sequelize' using CommonJS require syntax
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Student extends Model {}

  Student.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    lastName: DataTypes.STRING,
    firstName: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    gradYear: DataTypes.INTEGER,
  }, { sequelize, modelName: 'Student', tableName: 'students' });

  return Student;
};


// // Importing sequelize and DataTypes from 'sequelize' using CommonJS require syntax
// const { Model, DataTypes } = require('sequelize');

// // Importing sequelize instance from '../database' using CommonJS require syntax
// const sequelize = require('./index.js');

// class Student extends Model {}

// Student.init({
//   name: DataTypes.STRING,
//   birthDate: DataTypes.DATE,
//   gradYear: DataTypes.INTEGER,
//   weight: DataTypes.INTEGER,
//   height: DataTypes.INTEGER,
// }, { sequelize, modelName: 'Student', tableName: 'students' });

// // Exporting Student model using CommonJS module.exports syntax
// module.exports = Student;
