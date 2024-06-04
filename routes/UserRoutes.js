const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');


//import models
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize, Sequelize } = require('../models');

//import helper functions
const { createUser, findUserById, detailedUser, updateUserDetails } = require('../utils/user/helper_functions/UserHelpers');
const UserDTO = require('../utils/user/dto/UserDTO');
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const userRowHandler = require('../utils/user/csv_handling/UserCSVRowHandler');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//import validation middleware
const { userValidationRules, updateUserValidationRules } = require('../utils/validation/ValidationRules');
const validate = require('../utils/validation/ValidationMiddleware');

//routes
//create user
router.post('/users/register', userValidationRules(), validate, async (req, res, next) => {
  try {
    const newUser = await createUser(req.body);
    const userWithDetails = await findUserById(newUser.id);
    const userDto = new UserDTO(userWithDetails.toJSON());

    return res.status(201).json(userDto);

  } catch (err) {
    next(err)
  }

});

//get users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        { model: StudentDetail, as: 'studentDetails'},
        { model: TeacherDetail, as: 'teacherDetails'},
        { model: AdminDetail, as: 'adminDetails'},
      ]
    });

    const usersDTO = users.map(user => new UserDTO(user.toJSON()));

    res.json(usersDTO);
  } catch (err) {
    next(err);
  }
});

//get user by id
router.get('/users/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);
    const userDto = new UserDTO(user);
    res.json(userDto);
  } catch (err) {
    next(err);
  }
});

//bulk upload from csv
router.post('/users/register-upload-csv', upload.single('file'), async (req, res, next) => {

  let transaction;

  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    const newUsers = await processCsv(content, userRowHandler);

    transaction = await sequelize.transaction();

    for (const user of newUsers) {
      await createUser(user, transaction );
    }

    await transaction.commit();
    const users = await User.findAll({
      include: [
        { model: StudentDetail, as: 'studentDetails'},
        { model: TeacherDetail, as: 'teacherDetails'},
        { model: AdminDetail, as: 'adminDetails'},
      ]
    });

    const usersDTO = users.map(user => new UserDTO(user.toJSON()));

    res.status(201).json(usersDTO);
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error in POST /users/register-upload-csv', err);
    next(err);
  }
});

//edit user by id
router.patch('/users/:id', updateUserValidationRules(), validate, async (req, res, next) => {
  const { id } = req.params;
  const { password, ...otherFields } = req.body;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    if (password) {
      otherFields.password = await hashPassword(password);
    }
    
    await user.update(otherFields);

    // Update details if present
    if (req.body.studentDetails || req.body.teacherDetails || req.body.adminDetails) {
      const detailUpdates = {
        studentDetails: req.body.studentDetails,
        teacherDetails: req.body.teacherDetails,
        adminDetails: req.body.adminDetails
      };
      await updateUserDetails(user, detailUpdates);
    }

    const updatedUser = await findUserById(id); // Fetch updated user
    const userDto = new UserDTO(updatedUser);
    res.status(200).json(userDto);
  } catch (err) {
    console.error('Error in PATCH /users/:id', err);
    next(err);
  }
});




//delete user by id
router.delete('/users/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);

    await user.destroy();
    // Send a 200 status code with a success message
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    console.error('Error in DELETE /users/:id:', err); // Log the error for debugging
    next(err);
  }
});


module.exports = router;
