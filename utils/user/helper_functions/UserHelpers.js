// const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, Section, SectionRoster } = require('../../../models');

const { UserDetailUpdateError} = require('../../error_handling/CustomErrors');

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

// Get all users with details
async function getUsersWithDetails() {
  return await User.findAll({
      include: [
          { model: StudentDetail, as: 'studentDetails' },
          { model: TeacherDetail, as: 'teacherDetails' },
          { model: AdminDetail, as: 'adminDetails' },
      ]
  });
}

//find user by id
async function findUserById(id) {
    const user = await User.findByPk(id, {
      include: [
        { model: StudentDetail, as: 'studentDetails'},
        { model: TeacherDetail, as: 'teacherDetails'},
        { model: AdminDetail, as: 'adminDetails'},
        { model: StudentAnthro, as: 'studentAnthro'},
      ]
    });
  
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
  
    return user;
  }


//get users by userType and isArchived, with details
async function getUsersByTypeAndArchived(userType = null, isArchived = null, offset = 0, limit = 24, searchText = '', graduationYear = null, sectionCode = null) {
  const whereClause = {};

  // Add userType to the where clause if it's provided
  if (userType) {
    whereClause.userType = userType;
  }

  // Add isArchived to the where clause if it's not null
  if (isArchived !== null) {
    whereClause.isArchived = isArchived;
  }

  // Add searchText condition if provided
  if (searchText) {
    whereClause[Op.or] = [
      { firstName: { [Op.iLike]: `%${searchText}%` } },
      { lastName: { [Op.iLike]: `%${searchText}%` } }
    ];
  }

  // Add graduationYear if provided
  if (graduationYear) {
    whereClause['$studentDetails.gradYear$'] = parseInt(graduationYear);
  }

  // Add sectionCode if provided (assuming a join on section)
  if (sectionCode) {
    whereClause['$sectionRoster.section.sectionCode$'] = sectionCode;
  }

  const include = [
    {
      model: StudentDetail,
      as: 'studentDetails',
      attributes: ['gradYear'], // Include only necessary attributes
    },
    {
      model: TeacherDetail,
      as: 'teacherDetails',
      attributes: ['yearsExp', 'bio'],
    },
    {
      model: AdminDetail,
      as: 'adminDetails',
      attributes: ['yearsExp', 'bio'],
    },
  ];

  // If userType is 'student', include the Section association through SectionRoster
  if (userType === 'student') {
    include.push({
      model: SectionRoster,
      as: 'sectionRoster', // Match the alias defined in User -> SectionRoster association
      attributes: ['id', 'studentUserId', 'sectionId'], // Include necessary fields
      required: false,
      include: [
        {
          model: Section,
          as: 'section', // Match the alias defined in SectionRoster -> Section association
          attributes: ['id', 'sectionCode', 'gradeLevel', 'isActive'], // Include necessary fields
          required: false,
        },
      ],
    });
  }

  try {
    const result = await User.findAll({
      where: whereClause,
      include: include,
      order: [
        ['lastName', 'ASC'], // Sort by lastName in ascending order
        ['firstName', 'ASC'], // Then by firstName in ascending order
      ],
      offset: offset, // Start position for fetching records
      limit: limit,   // Number of records to fetch
      logging: console.log, // Log the SQL query for debugging
    });

    console.log(JSON.stringify(result, null, 2)); // Log the full result
    return result;

  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}






// Get total count of users by userType
async function getTotalUsersCountByType(userType) {
  return await User.count({
    where: {
      userType: userType,
      isArchived: false
    }
  });
}


// async function getUsersByTypeAndArchived(userType = null, isArchived = null) {
//   const whereClause = {};

//   // Add userType to the where clause if it's provided
//   if (userType) {
//     whereClause.userType = userType;
//   }

//   // Add isArchived to the where clause if it's not null
//   if (isArchived !== null) {
//     whereClause.isArchived = isArchived;
//   }

//   return await User.findAll({
//     where: whereClause,
//     include: [
//       { model: StudentDetail, as: 'studentDetails' },
//       { model: TeacherDetail, as: 'teacherDetails' },
//       { model: AdminDetail, as: 'adminDetails' },
//     ]
//   });
// }

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
  try {
    switch (user.userType) {
      case 'student':
        if (detailUpdates.studentDetails) {
          const studentDetails = await user.getStudentDetails();
          return studentDetails ? await studentDetails.update(detailUpdates.studentDetails) : null;
        }
        break;
      case 'teacher':
        if (detailUpdates.teacherDetails) {
          const teacherDetails = await user.getTeacherDetails();
          return teacherDetails ? await teacherDetails.update(detailUpdates.teacherDetails) : null;
        }
        break;
      case 'admin':
        if (detailUpdates.adminDetails) {
          const adminDetails = await user.getAdminDetails();
          return adminDetails ? await adminDetails.update(detailUpdates.adminDetails) : null;
        }
        break;
    }
  } catch (err) {
    console.error('Error updating user details:', err);
    throw new UserDetailUpdateError(user.userType, err.message);
  }
}

async function updateUserAndDetails(user, fields) {
  const { studentDetails, teacherDetails, adminDetails, ...otherFields } = fields;

  // Update user basic details (except for student, teacher, admin details)
  await user.update(otherFields);

  // Update user role-specific details if provided
  if (studentDetails || teacherDetails || adminDetails) {
      const detailUpdates = {
          studentDetails,
          teacherDetails,
          adminDetails
      };
      await updateUserDetails(user, detailUpdates);
  }
}




module.exports = {
    createUser,
    findUserById,
    getUsersByTypeAndArchived,
    getTotalUsersCountByType,
    detailedUser,
    getUsersWithDetails,
    updateUserDetails,
    updateUserAndDetails
};