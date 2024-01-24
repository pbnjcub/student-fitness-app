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
const { userValidationRules, updateUserValidationRules } = require('../utils/ValidationRules');
const validate = require('../utils/ValidationMiddleware');

//routes
//create user
router.post('/users/register', userValidationRules(), validate, async (req, res, next) => {
  try {
    const newUser = await createUser(req.body);
    const userDto = new UserDTO(newUser);
    const userWithDetails = await findUserById(userDto.id);

    return res.status(201).json(userWithDetails);

  } catch (err) {
    next(err)
  }

});

  //   console.log('Caught Error:', err.message);

  //   if (err.message === "User already exists.") {
  //     return res.status(409).json({ error: err.message });
  //   } else if (err.message === "Invalid user type") {
  //     return res.status(400).json({ error: err.message });
  //   }
  //   return res.status(500).json({ error: 'Internal Server Error' });
  // }
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
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
    } else {
      console.error('Error in GET /users/:id', err);
      res.status(500).send('Server error');
    }
  }
});

//bulk upload
router.post('/users/register-upload-csv', upload.single('file'), async (req, res) => {

  let transaction;

  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();
    console.log('Content - main route:', content);

    const newUsers = await processCsv(content, userRowHandler);
    console.log('newUsers:', newUsers);

    transaction = await sequelize.transaction();
    console.log('Transaction started - main route')
    for (const user of newUsers) {
      await createUser(user, transaction );
      console.log('User created:', user);
    }

    await transaction.commit();
    console.log('Transaction committed - main route')
    const users = await User.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        { model: StudentDetail, as: 'studentDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: TeacherDetail, as: 'teacherDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
        { model: AdminDetail, as: 'adminDetails', attributes: { exclude: ['createdAt', 'updatedAt'] } },
      ]
    });

    res.status(201).json(users);
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error in POST /users/register-upload-csv', err);

    if (Array.isArray(err)) {
      console.error('Validation Errors:', err);
      return res.status(422).json({ errors: err });
    } else {
      const statusCode = err instanceof Sequelize.UniqueConstraintError ? 409 : 500;
      res.status(statusCode).send({ message: err.message || 'Server error' });
    }
  }
});

//edit user by id
router.patch('/users/:id', updateUserValidationRules(), validate, async (req, res) => {
  const { id } = req.params;
  const { password, ...otherFields } = req.body;

  try {
    console.log("Finding user by ID...");
    const user = await findUserById(id);
    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    if (password) {
      console.log("Hashing password...");
      otherFields.password = await hashPassword(password);
    }
    
    console.log("Updating user basic information...");
    await user.update(otherFields);

    // Update details if present
    if (req.body.studentDetails || req.body.teacherDetails || req.body.adminDetails) {
      console.log("Updating user details...");
      const detailUpdates = {
        studentDetails: req.body.studentDetails,
        teacherDetails: req.body.teacherDetails,
        adminDetails: req.body.adminDetails
      };
      await updateUserDetails(user, detailUpdates);
    }

    console.log("Fetching updated user...");
    const updatedUser = await findUserById(id); // Fetch updated user
    console.log("Updated user data:", updatedUser);
    res.status(200).json(updatedUser.toJSON());
  } catch (err) {
    console.error('Error in PATCH /users/:id:', err);

    if (err instanceof Sequelize.ValidationError) {
      console.log("Sequelize validation error:", err);
      return res.status(400).json({ errors: err.errors.map(e => ({ [e.path]: e.message })) });
    }

    console.log("Unhandled error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




//delete user by id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);

    await user.destroy();
    // Send a 200 status code with a success message
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    console.error('Error in DELETE /users/:id:', err); // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
