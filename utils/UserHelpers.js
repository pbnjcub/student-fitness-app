const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail } = require('../models');

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
  
  if (userData.userType === 'student') {
      userDetails = {
        ...userData.studentDetails ? userData.studentDetails : null
      };
  } else if (userData.userType === 'teacher') {
      userDetails = {
          ...userData.teacherDetails ? userData.teacherDetails : null
      };
  } else if (userData.userType === 'admin') {
      userDetails = {
          ...userData.adminDetails ? userData.adminDetails : null
      };
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
    findUserById,
    detailedUser,
    updateUserDetails
};