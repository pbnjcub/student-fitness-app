const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail } = require('../models');

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

    const [user, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: mainUserData,
      transaction
  });

  if (!created) {
    throw new Error('User already exists');
  }

  // Create user details
  switch (userData.userType) {
    case 'student':
        await StudentDetail.create({
            userId: user.id,
            gradYear: userData.studentDetails.gradYear || null
        }, { transaction });
        break;
    case 'teacher':
        await TeacherDetail.create({
            userId: user.id,
            yearsExp: userData.teacherDetails.yearsExp || null,
            bio: userData.teacherDetails.bio || null
        }, { transaction });
        break;
    case 'admin':
        await AdminDetail.create({
            userId: user.id,
            yearsExp: userData.adminDetails.yearsExp || null,
            bio: userData.adminDetails.bio || null
        }, { transaction });
        break;
    default:
        throw new Error("Invalid user type");
}

return user;
} catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
        throw new Error('User already exists');
    } else if (error instanceof Sequelize.ValidationError) {
      console.error('Error creating user:', error);
      throw error;
    }
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