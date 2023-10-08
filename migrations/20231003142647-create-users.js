'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      genderIdentity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pronouns: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userType: {
        type: Sequelize.ENUM('student', 'teacher', 'admin'),
        allowNull: false,
      },
      photoUrl: {
        type: Sequelize.STRING, // Assuming the URL or path is a string.
        allowNull: true
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Check existence of tables
    // const studentDetailsExists = await queryInterface.hasTable('student_details');
    // const teacherDetailsExists = await queryInterface.hasTable('teacher_details');
    // const adminDetailsExists = await queryInterface.hasTable('admin_details'); // Assuming you have this table.
  
    // // If any of the tables still exist, throw an error.
    // if (studentDetailsExists || teacherDetailsExists || adminDetailsExists) {
    //   throw new Error('Dependent tables (student_details, teacher_details, admin_details) still exist. Drop them first.');
    // }
  
    await queryInterface.dropTable('users');
  }
  
};
