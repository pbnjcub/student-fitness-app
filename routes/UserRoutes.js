const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');

//import models
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize } = require('../models');

//import helper functions
const { findUserById, detailedUser, updateUserDetails } = require('../utils/UserHelpers');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//helper functions
function userDTO(user) {
  return {
      id: user.id,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      birthDate: user.birthDate,
      genderIdentity: user.genderIdentity,
      pronouns: user.pronouns,
      userType: user.userType,
      photoUrl: user.photoUrl,
      isArchived: user.isArchived,
      dateArchived: user.dateArchived
  };
}

const checkRequired = (userData) => {
  const { email, password, lastName, firstName, birthDate, userType } = userData;

  const missingFields = [];
  
  if (!email) missingFields.push('Email');
  if (!password) missingFields.push('Password');
  if (!lastName) missingFields.push('Last name');
  if (!firstName) missingFields.push('First name');
  if (!birthDate) missingFields.push('Birth date');
  if (!userType) missingFields.push('User type');

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
}

async function createUser(userData, transaction = null) {

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
      return null;
  }

  // Create user details
  switch (userData.userType) {
      case 'student':
          await StudentDetail.create({
              userId: user.id,
              gradYear: userData.gradYear || null
          }, { transaction });
          break;
      case 'teacher':
          await TeacherDetail.create({
              userId: user.id,
              yearsExp: userData.yearsExp || null,
              bio: userData.bio || null
          }, { transaction });
          break;
      case 'admin':
          await AdminDetail.create({
              userId: user.id,
              yearsExp: userData.yearsExp || null,
              bio: userData.bio || null
          }, { transaction });
          break;
      default:
          throw new Error("Invalid user type");
  }

  return user;
}


async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//routes
//create user
router.post('/users/register', async (req, res) => {
  try {
    const requiredCheck = checkRequired(req.body);
    if (requiredCheck !== true) {
      return res.status(400).json({ error: requiredCheck });
    }

    const user = await createUser(req.body);
    const mainUserData = userDTO(user);
    const userWithDetails = await detailedUser(mainUserData);

    return res.status(201).json(userWithDetails);

  } catch (err) {
    if (err.message === "User already exists.") {
      return res.status(409).json({ error: err.message });
    } else if (err.message === "Invalid user type") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        { model: StudentDetail, as: 'studentDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: TeacherDetail, as: 'teacherDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: AdminDetail, as: 'adminDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
      ]
    });

    res.json(users);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).send('Server error');
  }
});


//get user by id
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);
    res.json(user);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      console.error('Error in GET /users/:id', error);
      res.status(500).send('Server error');
    }
  }
});

//bulk upload
router.post('/users/upload', upload.single('file'), async (req, res) => {

  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    const newUsers = [];
    const errors = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        const transaction = await sequelize.transaction();
        try {
          for (const userData of results.data) {
            const requiredCheck = checkRequired(userData);
            if (requiredCheck !== true) {
              errors.push({ userData, error: requiredCheck });
            } else {
              try {
                const newUser = await createUser(userData, transaction);
                if (!newUser) {
                  errors.push({ userData, error: `User with email ${userData.email} already exists` });
                } else {
                  newUsers.push(userDTO(newUser));
                }
              } catch (error) {
                errors.push({ userData, error: error.message });
              }
            }
          }
          if (errors.length > 0) {
            await transaction.rollback();
            res.status(400).json({ error: 'Some users could not be processed', details: errors });
          } else {
            await transaction.commit();
            res.status(200).json({ success: 'File uploaded and processed successfully', newUsers });
          }
        } catch (error) {
          await transaction.rollback(); // Rollback the transaction if there's an error
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//edit user by id
router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const {
    email, password, lastName, firstName, birthDate, genderIdentity,
    pronouns, photoUrl, userType, isArchived, dateArchived, studentDetails, teacherDetails, adminDetails
  } = req.body;

  try {
    const user = await findUserById(id);
    const updatedUserValues = { email, lastName, firstName, birthDate, genderIdentity, pronouns, photoUrl, userType, isArchived, dateArchived };
    if (password) updatedUserValues.password = await hashPassword(password);
    await user.update(updatedUserValues);

    // Object containing all types of detail updates
    const detailUpdates = {
      studentDetails: req.body.studentDetails,
      teacherDetails: req.body.teacherDetails,
      adminDetails: req.body.adminDetails
    };

    await updateUserDetails(user, detailUpdates);
  
    const updatedUser = await findUserById(id); // Fetch updated user
    res.status(200).json(updatedUser.toJSON());
  } catch (error) {
    console.error('Error in PATCH /users/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//delete user by id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);

    await user.destroy();
    res.status(204).json("User successfully deleted");
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
