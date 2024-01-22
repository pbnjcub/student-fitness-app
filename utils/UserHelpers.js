const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail } = require('../models');
const { validationResult } = require('express-validator');

async function createUserDetails(user, userType, details, transaction) {
  switch (userType) {
    case 'student':
      if (details.studentDetails) {
        if (typeof details.studentDetails.gradYear !== 'number' || details.studentDetails.gradYear == null) {
          throw new Error('Invalid or missing graduation year for student');
        }
        await StudentDetail.create({
          userId: user.id,
          ...details.studentDetails
        }, { transaction });
      } else {
        throw new Error('Missing student details');
      }
      break;
    case 'teacher':
      if (details.teacherDetails) {
        await TeacherDetail.create({
          userId: user.id,
          ...details.teacherDetails
        }, { transaction });
      }
      break;
    case 'admin':
      if (details.adminDetails) {
        await AdminDetail.create({
          userId: user.id,
          ...details.adminDetails
        }, { transaction });
      }
      break;
    default:
      console.log("createUserDetails - Invalid user type");
      throw new Error("Invalid user type");
  }
}

//create user
async function createUser(userData, transaction = null) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const mainUserData = {
      email: userData.email,
      password: hashedPassword,
      lastName: userData.lastName,
      firstName: userData.firstName,
      birthDate: userData.birthDate,
      genderIdentity: userData.genderIdentity,
      pronouns: userData.pronouns,
      userType: userData.userType,
      photoUrl: userData.photoUrl,
      isArchived: userData.isArchived || false,
      dateArchived: userData.dateArchived || null
    };

    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('User already exists.');
    }

    const [user, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: mainUserData,
      transaction: transaction
    });

    if (!created) {
      throw new Error('User already exists.');
    }

    await createUserDetails(user, userData.userType, userData, transaction);

    return user;
  } catch (err) {
    console.error('Error in createUser:', err);
    throw err;
  }
}

//find user by id
async function findUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        { model: StudentDetail, as: 'studentDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: TeacherDetail, as: 'teacherDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: AdminDetail, as: 'adminDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: StudentAnthro, as: 'studentAnthro', attributes: { exclude: ['createdAt', 'updatedAt'] } },
      ]
    });
  
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
  
    return user;
  }
  

//find user by id with details
async function detailedUser(userData) {
  let userDetails = {};


  switch (userData.userType) {
    case 'student':
      userDetails = userData.studentDetails || null;
      break;
    case 'teacher':
      userDetails = userData.teacherDetails || null;
      break;
    case 'admin':
      userDetails = userData.adminDetails || null;
      break;
  }

  return {
    ...userData,
    details: userDetails
  };
}


//update user details
async function updateUserDetails(user, detailUpdates) {
  console.log("Starting updateUserDetails...");
  try {
    console.log("User type:", user.userType);
    switch (user.userType) {
      case 'student':
        console.log("Handling student details update...");
        if (detailUpdates.studentDetails) {
          console.log("Student details provided:", detailUpdates.studentDetails);
          const studentDetails = await user.getStudentDetails();
          return studentDetails ? await studentDetails.update(detailUpdates.studentDetails) : null;
        }
        break;
      case 'teacher':
        console.log("Handling teacher details update...");
        if (detailUpdates.teacherDetails) {
          console.log("Teacher details provided:", detailUpdates.teacherDetails);
          const teacherDetails = await user.getTeacherDetails();
          return teacherDetails ? await teacherDetails.update(detailUpdates.teacherDetails) : null;
        }
        break;
      case 'admin':
        console.log("Handling admin details update...");
        if (detailUpdates.adminDetails) {
          console.log("Admin details provided:", detailUpdates.adminDetails);
          const adminDetails = await user.getAdminDetails();
          return adminDetails ? await adminDetails.update(detailUpdates.adminDetails) : null;
        }
        break;
    }
  } catch (err) {
    console.error('Error updating user details:', err);
    throw err; // This will be caught by the route's catch block
  }
}




module.exports = {
    createUser,
    findUserById,
    detailedUser,
    updateUserDetails
};