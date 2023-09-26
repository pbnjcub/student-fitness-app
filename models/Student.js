
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Student extends Model {}

Student.init({
  name: DataTypes.STRING,
  age: DataTypes.INTEGER,
  grade: DataTypes.STRING,
  weight: DataTypes.INTEGER,
  height: DataTypes.STRING,
}, { sequelize, modelName: 'student' });

module.exports = Student;
