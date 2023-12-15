const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');


//import models
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize, Sequelize } = require('../models');

//import helper functions
const { createUser, findUserById, detailedUser, updateUserDetails } = require('../utils/UserHelpers');
const UserDTO = require('../utils/UserDTO');
const processCsv = require('../utils/GenCSVHandler');
const userRowHandler = require('../utils/UserCSVRowHandler');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//import validation middleware
const { userValidationRules } = require('../utils/ValidationRules');
const validate = require('../utils/ValidationMiddleware');

//routes
//create user
router.post('/users/register', userValidationRules(), validate, async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    const userDto = new UserDTO(newUser);
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
router.post('/users/register-upload-csv', upload.single('file'), async (req, res) => {
  console.log("Inside POST /users/register-upload-csv")
  console.log(req.file)
  let transaction;

  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    const newUsers = await processCsv(content, userRowHandler);


    transaction = await sequelize.transaction();
    console.log("Transaction started:", transaction);
    for (const user of newUsers) {
      await createUser(user, transaction );
    }

    await transaction.commit();

    const users = await User.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        { model: StudentDetail, as: 'studentDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: TeacherDetail, as: 'teacherDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: AdminDetail, as: 'adminDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
      ]
    });

    res.status(201).json(users);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in POST /users/register-upload-csv', error);

    const statusCode = error instanceof Sequelize.UniqueConstraintError ? 409 : 500;
    res.status(statusCode).send({ message: error.message || 'Server error' });
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

//     Papa.parse(content, {
//       header: true,
//       dynamicTyping: true,
//       complete: async (results) => {
//         const transaction = await sequelize.transaction();
//         try {
//           for (const userData of results.data) {
//               try {
//                 const newUser = await createUser(userData, transaction);
//                 const userDto = new UserDTO(newUser);
//                 const userWithDetails = await findUserById(userDto.id);
//                 newUsers.push(userWithDetails);
//               } catch (error) {
//                 errors.push(error.message);
//               }
//           }
//           await transaction.commit();
//           res.status(201).json({ newUsers, errors });
//         } catch (error) {
//           await transaction.rollback();
//           console.error('Error in POST /users/register-upload-csv', error);
//           res.status(500).send('Server error');
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in POST /users/register-upload-csv', error);
//     res.status(500).send('Server error');
//   }