const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// import models
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize, Sequelize } = require('../models');

// import helper functions
const { createUser, findUserById, detailedUser, updateUserDetails } = require('../utils/user/helper_functions/UserHelpers');
const UserDTO = require('../utils/user/dto/UserDTO');
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const userRowHandler = require('../utils/user/csv_handling/UserCSVRowHandler');

//import validation middleware
const { createUserValidationRules, updateUserValidationRules } = require('../utils/user/middleware_validation/UserReqObjValidation');
const validate = require('../utils/validation/ValidationMiddleware');
const { checkUserExists } = require('../utils/user/middleware_validation/CheckUserExists');
const { checkEmailExists } = require('../utils/user/middleware_validation/CheckEmailExists');

//create user
router.post('/users/register',
    createUserValidationRules(),
    validate,
    checkEmailExists,
    async (req, res, next) => {
        try {
            const newUser = await createUser(req.body);
            const userWithDetails = await findUserById(newUser.id);
            const userDto = new UserDTO(userWithDetails.toJSON());
            return res.status(201).json(userDto);
        } catch (err) {
            next(err);
        }
});

// Retrieve all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [
                { model: StudentDetail, as: 'studentDetails' },
                { model: TeacherDetail, as: 'teacherDetails' },
                { model: AdminDetail, as: 'adminDetails' },
            ]
        });

        const usersDTO = users.map(user => new UserDTO(user.toJSON()));
        res.json(usersDTO);
    } catch (err) {
        next(err);
    }
});

// Retrieve only admin users
router.get('/users/admin', async (req, res, next) => {
    try {
        const admins = await User.findAll({
            where: { userType: 'admin' }, // Retrieve only users with role 'admin'
            include: [
                { model: AdminDetail, as: 'adminDetails' }
            ]
        });

        const adminDTOs = admins.map(admin => new UserDTO(admin.toJSON()));
        res.json(adminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active admin users
router.get('/users/admin/active', async (req, res, next) => {
    try {
        const admins = await User.findAll({
            where: { userType: 'admin', isArchived: false }, // Retrieve only users with role 'admin'
            include: [
                { model: AdminDetail, as: 'adminDetails' }
            ]
        });

        const adminDTOs = admins.map(admin => new UserDTO(admin.toJSON()));
        res.json(adminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only student users
router.get('/users/student', async (req, res, next) => {
    try {
        const students = await User.findAll({
            where: { userType: 'student' }, // Retrieve only users with role 'student'
            include: [
                { model: StudentDetail, as: 'studentDetails' }
            ]
        });

        const studentDTOs = students.map(student => new UserDTO(student.toJSON()));
        res.json(studentDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active student users
router.get('/users/student/active', async (req, res, next) => {
    try {
        const students = await User.findAll({
            where: { userType: 'student', isArchived: false }, // Retrieve only users with role 'student'
            include: [
                { model: StudentDetail, as: 'studentDetails' }
            ]
        });

        const studentDTOs = students.map(student => new UserDTO(student.toJSON()));
        res.json(studentDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only teacher users
router.get('/users/teacher', async (req, res, next) => {
    try {
        const teachers = await User.findAll({
            where: { userType: 'teacher' }, // Retrieve only users with role 'teacher'
            include: [
                { model: TeacherDetail, as: 'teacherDetails' }
            ]
        });

        const teacherDTOs = teachers.map(teacher => new UserDTO(teacher.toJSON()));
        res.json(teacherDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active teacher users
router.get('/users/teacher/active', async (req, res, next) => {
    try {
        const teachers = await User.findAll({
            where: { userType: 'teacher', isArchived: false }, // Retrieve only users with role 'teacher'
            include: [
                { model: TeacherDetail, as: 'teacherDetails' }
            ]
        });

        const teacherDTOs = teachers.map(teacher => new UserDTO(teacher.toJSON()));
        res.json(teacherDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active teacher and admin users
router.get('/users/teacher-admin/active', async (req, res, next) => {
    try {
        const teachersAndAdmins = await User.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { userType: 'teacher' },
                    { userType: 'admin' }
                ],
                isArchived: false
            },
            include: [
                { model: TeacherDetail, as: 'teacherDetails' },
                { model: AdminDetail, as: 'adminDetails' }
            ]
        });

        const teacherAndAdminDTOs = teachersAndAdmins.map(user => new UserDTO(user.toJSON()));
        res.json(teacherAndAdminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only non-archived, active users
router.get('/users/active', async (req, res, next) => {
    try {
        const activeUsers = await User.findAll({
            where: { isArchived: false }, // Retrieve only non-archived users
            include: [
                { model: StudentDetail, as: 'studentDetails' },
                { model: TeacherDetail, as: 'teacherDetails' },
                { model: AdminDetail, as: 'adminDetails' },
            ]
        });

        const activeUsersDTO = activeUsers.map(user => new UserDTO(user.toJSON()));
        res.json(activeUsersDTO);
    } catch (err) {
        next(err);
    }
});

// Retrieve only archived users
router.get('/users/archived', async (req, res, next) => {
    try {
        const archivedUsers = await User.findAll({
            where: { isArchived: true }, // Retrieve only archived users
            include: [
                { model: StudentDetail, as: 'studentDetails' },
                { model: TeacherDetail, as: 'teacherDetails' },
                { model: AdminDetail, as: 'adminDetails' },
            ]
        });

        const archivedUsersDTO = archivedUsers.map(user => new UserDTO(user.toJSON()));
        res.json(archivedUsersDTO);
    } catch (err) {
        next(err);
    }
});

// Retrieve user by id
router.get('/users/:id',
    checkUserExists,
    async (req, res, next) => {
        const { id } = req.params;

        try {
            const user = await findUserById(id);
            const userDto = new UserDTO(user);
            res.json(userDto);
        } catch (err) {
            next(err);
        }
    }
);

//bulk upload from csv
router.post('/users/register-upload-csv', upload.single('file'), async (req, res, next) => {
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    const newUsers = await processCsv(content, userRowHandler);

    const transaction = await sequelize.transaction();

    try {
      for (const user of newUsers) {
        await createUser(user, transaction);
      }

      await transaction.commit();

      const users = await User.findAll({
        include: [
          { model: StudentDetail, as: 'studentDetails' },
          { model: TeacherDetail, as: 'teacherDetails' },
          { model: AdminDetail, as: 'adminDetails' },
        ]
      });

      const usersDTO = users.map(user => new UserDTO(user.toJSON()));
      res.status(201).json(usersDTO);
    } catch (err) {
      await transaction.rollback();
      console.error('Error in transaction for POST /users/register-upload-csv', err);
      next(err);
    }
  } catch (err) {
    console.error('Error in POST /users/register-upload-csv', err);
    next(err);
  }
});

// Edit user by id
router.patch('/users/:id',
    checkUserExists,
    updateUserValidationRules(),
    validate,
    // check if user is associated with a section. don't want to be able to archive if associated
        // student cannot be part of a section
        // teacher or admin cannot have a teacher assignment
    async (req, res, next) => {
        const { id } = req.params;
        const { password, ...otherFields } = req.body;
        try {
            const user = req.user;

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
