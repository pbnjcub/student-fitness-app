const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail } = require('../models');

//create user
async function createUser(userData, transaction = null) {
  console.log("createUser - Start. userData:", userData);

  try {
      console.log("createUser - Hashing password");
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

      console.log("createUser - Transaction object:", transaction);

      console.log("createUser - Attempting to find or create user:", mainUserData.email);
      const [user, created] = await User.findOrCreate({
          where: { email: userData.email },
          defaults: mainUserData,
          transaction: transaction
      });

      console.log("createUser - User findOrCreate operation completed. Created:", created, "User:", user.toJSON());

      // Create user details
      switch (userData.userType) {
          case 'student':
              console.log("createUser - Creating student details");
              await StudentDetail.create({
                  userId: user.id,
                  gradYear: userData.studentDetails.gradYear || null
              }, { transaction });
              break;
          case 'teacher':
              console.log("createUser - Creating teacher details");
              await TeacherDetail.create({
                  userId: user.id,
                  yearsExp: userData.teacherDetails.yearsExp || null,
                  bio: userData.teacherDetails.bio || null
              }, { transaction });
              break;
          case 'admin':
              console.log("createUser - Creating admin details");
              await AdminDetail.create({
                  userId: user.id,
                  yearsExp: userData.adminDetails.yearsExp || null,
                  bio: userData.adminDetails.bio || null
              }, { transaction });
              break;
          default:
              console.log("createUser - Invalid user type");
              throw new Error("Invalid user type");
      }

      console.log("createUser - End. User processed:", user.toJSON());
      return user;
  } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
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
  let updatedDetails;

  try {
    switch (user.userType) {
      case 'student':
        if (detailUpdates.studentDetails) {
          const studentDetails = await user.getStudentDetails();
          updatedDetails = studentDetails ? await studentDetails.update(detailUpdates.studentDetails) : null;
        }
        break;
      case 'teacher':
        if (detailUpdates.teacherDetails) {
          const teacherDetails = await user.getTeacherDetails();
          updatedDetails = teacherDetails ? await teacherDetails.update(detailUpdates.teacherDetails) : null;
        }
        break;
      case 'admin':
        if (detailUpdates.adminDetails) {
          const adminDetails = await user.getAdminDetails();
          updatedDetails = adminDetails ? await adminDetails.update(detailUpdates.adminDetails) : null;
        }
        break;
    }
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }

  return updatedDetails;
}



module.exports = {
    createUser,
    findUserById,
    detailedUser,
    updateUserDetails
};