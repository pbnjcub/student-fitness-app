const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail } = require('../models');

//find user by id
async function findUserById(id, includes = []) {
    console.log(`Starting findUserById(${id})...`)
    return await User.findByPk(id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: includes
    });
  }
  

//find user by id with details
async function detailedUser(userData) {
    console.log(`Starting detailedUser(${userData.id})...`);
    const includes = [
        {
            model: StudentDetail,
            as: 'studentDetails',
            required: false,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        {
            model: TeacherDetail,
            as: 'teacherDetails',
            required: false,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        {
            model: AdminDetail,
            as: 'adminDetails',
            required: false,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
    ];

    const user = await findUserById(userData.id, includes);

    console.log(`Found user:`, user.toJSON())
    let userDetails = {};
    
    if (user && user.userType === 'student') {
        userDetails = {
          ...user.studentDetails ? user.studentDetails.toJSON() : null
        };
    } else if (user.userType === 'teacher') {
        userDetails = {
            ...user.teacherDetails ? user.teacherDetails.toJSON() : null
        };
    } else if (user.userType === 'admin') {
        userDetails = {
            ...user.adminDetails ? user.adminDetails.toJSON() : null
        };
    }
  
    return {
        ...userData.toJSON(),
        details: userDetails
    };
  }

module.exports = {
    findUserById,
    detailedUser
};