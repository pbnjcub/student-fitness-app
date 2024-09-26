const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import Models
const {
    User,
    StudentDetail,
    StudentAnthro,
    TeacherDetail,
    AdminDetail,
    sequelize,
    Sequelize
} = require('../models');

// Import Helper Functions
const {
    createUser,
    findUserById,
    detailedUser,
    updateUserDetails,
    updateUserAndDetails,
    getUsersWithDetails,
    getUsersByTypeAndArchived
} = require('../utils/user/helper_functions/UserHelpers');

// Import UserDto
const UserDto = require('../utils/user/dto/UserDto');

// Import Csv Handling Functions
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const userRowHandler = require('../utils/user/csv_handling/UserCSVRowHandler');
const { checkCsvForDuplicateEmails, checkCsvUsersExistEmail } = require('../utils/csv_handling/CsvExistingDataChecks');

// Import Transaction Handler
const { handleTransaction } = require('../utils/HandleTransaction');

//import Validation Middleware
const validate = require('../utils/validation/Validate');
const { createUserValidationRules, updateUserValidationRules } = require('../utils/user/middleware_validation/UserReqObjValidation');
const checkUserExists = require('../utils/validation/middleware/CheckUserExists');
const checkUserExistsByEmail = require('../utils/validation/middleware/CheckUserExistsByEmail');
const checkStudentRostered = require('../utils/validation/middleware/CheckStudentRostered');

//create user
router.post('/users/register',
    createUserValidationRules(),
    validate,
    checkUserExistsByEmail,
    async (req, res, next) => {
        try {
            const newUser = await createUser(req.body);
            const userWithDetails = await findUserById(newUser.id);
            const userDto = new UserDto(userWithDetails.toJSON());
            return res.status(201).json(userDto);
        } catch (err) {
            next(err);
        }
});

// Retrieve all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await getUsersWithDetails();

        const usersDTO = users.map(user => new UserDto(user.toJSON()));
        res.json(usersDTO);
    } catch (err) {
        next(err);
    }
});

// Retrieve only admin users
router.get('/users/admin', async (req, res, next) => {
    try {
        const admins = await getUsersByTypeAndArchived('admin');
        const adminDTOs = admins.map(admin => new UserDto(admin.toJSON()));
        res.json(adminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active admin users
router.get('/users/admin/active', async (req, res, next) => {
    try {
        const activeAdmins = await getUsersByTypeAndArchived('admin', false);
        const activeAdminDTOs = activeAdmins.map(admin => new UserDto(admin.toJSON()));
        res.json(activeAdminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only student users
router.get('/users/student', async (req, res, next) => {
    try {
        const students = await getUsersByTypeAndArchived('student');
        const studentDTOs = students.map(student => new UserDto(student.toJSON()));
        res.json(studentDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active student users
router.get('/users/student/active', async (req, res, next) => {
    try {
        const activeStudents = await getUsersByTypeAndArchived('student', false);
        const activeStudentDTOs = activeStudents.map(student => new UserDto(student.toJSON()));
        res.json(activeStudentDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only teacher users
router.get('/users/teacher', async (req, res, next) => {
    try {
        const teachers = await getUsersByTypeAndArchived('teacher');
        const teacherDTOs = teachers.map(teacher => new UserDto(teacher.toJSON()));
        res.json(teacherDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active teacher users
router.get('/users/teacher/active', async (req, res, next) => {
    try {
        const activeTeachers = await getUsersByTypeAndArchived('teacher', false);
        const activeTeacherDTOs = activeTeachers.map(teacher => new UserDto(teacher.toJSON()));
        res.json(activeTeacherDTOs);
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

        const teacherAndAdminDTOs = teachersAndAdmins.map(user => new UserDto(user.toJSON()));
        res.json(teacherAndAdminDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only non-archived, active users
router.get('/users/active', async (req, res, next) => {
    try {
        const activeUsers = await getUsersByTypeAndArchived(null, false); // Fetch all active users (not archived)
        const activeUsersDTO = activeUsers.map(user => new UserDto(user.toJSON()));
        res.json(activeUsersDTO);
    } catch (err) {
        next(err);
    }
});

// Retrieve only archived users
router.get('/users/archived', async (req, res, next) => {
    try {
        const archivedUsers = await getUsersByTypeAndArchived(null, true); // Fetch all archived users
        const archivedUsersDTO = archivedUsers.map(user => new UserDto(user.toJSON()));
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
            const userDto = new UserDto(user);
            res.json(userDto);
        } catch (err) {
            next(err);
        }
    }
);

//bulk upload from csv
router.post('/users/register-upload-csv',
    upload.single('file'),
    async (req, res, next) => {
        try {
            const buffer = req.file.buffer;
            const content = buffer.toString();
            const newUsers = await processCsv(content, userRowHandler);

            // Check for duplicate emails
            await checkCsvForDuplicateEmails(newUsers);

            // Check to see if Users already exist by email.
            const existingUsers = await checkCsvUsersExistEmail(newUsers);

            // Collect emails of existing users and handle error.
            const existingEmails = [];
            for (const [email, userDetails] of Object.entries(existingUsers)) {
                if (userDetails) { 
                    existingEmails.push(email);
                }
            }

            if (existingEmails.length > 0) {
                const err = new Error(`Users with the following emails already exist: ${existingEmails.join(', ')}`);
                err.status = 400;
                return next(err);
            }

            // Create users in a transaction
            await handleTransaction(async (transaction) => {
                for (const user of newUsers) {
                    await createUser(user, transaction);
                }
            });

            const users = await getUsersWithDetails();

            const usersDTO = users.map(user => new UserDto(user.toJSON()));
            res.status(201).json(usersDTO);
        } catch (err) {
            console.error('Error in POST /users/register-upload-csv', err);
            next(err);
        }
});

// Update user by id
router.patch('/users/:id',
    updateUserValidationRules(), // Validate the incoming data
    validate, // Run validation and handle any validation errors
    checkUserExists, // Ensure the user exists before proceeding
    checkStudentRostered, // Final check for rostered status and handle isArchived status change
    async (req, res, next) => {
        const { id } = req.params;
        const { password, ...otherFields } = req.body;
        try {
            if (password) {
                otherFields.password = await bcrypt.hash(password, 10);
            }

            const user = req.user;

            // Call the helper function to handle user and detail updates
            await updateUserAndDetails(user, otherFields);

            const updatedUser = await findUserById(id); // Fetch updated user
            const userDto = new UserDto(updatedUser);
            res.status(200).json(userDto);
        } catch (err) {
            console.error('Error in PATCH /users/:id', err);
            next(err);
        }
    }
);

//delete user by id
router.delete('/users/:id',
    checkUserExists,
    checkStudentRostered,
    async (req, res, next) => {
        const user = req.user; 

        try {
            await user.destroy();
            res.status(200).json({ message: "User successfully deleted" });
        } catch (err) {
            console.error('Error in DELETE /users/:id:', err);
            next(err);
        }
    }
);



module.exports = router;
