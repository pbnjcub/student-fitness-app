const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');


//import models
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize } = require('../models');

//import helper functions
const { createUser, findUserById, detailedUser, updateUserDetails } = require('../utils/UserHelpers');
const UserDTO = require('../utils/UserDTO');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//validation middleware
const { userValidationRules } = require('../utils/ValidationRules');
const validate = require('../utils/ValidationMiddleware');

//routes
//create user
router.post('/users/register', userValidationRules(), validate, async (req, res) => {
  try {
    const user = await createUser(req.body);
    const userDto = new UserDTO(user);
    const userWithDetails = await findUserById(userDto.id);

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
