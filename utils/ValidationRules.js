const { body } = require('express-validator');
const moment = require('moment');

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
        body('password').isLength({ min: 4, max: 128 }).withMessage('Password must be at least 4 and at most 128 characters'),
        body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
        body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
        body('birthDate').not().isEmpty().withMessage('Birth date is required')
            .custom((value) => moment(value, 'YYYY-MM-DD', true).isValid())
            .withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        body('genderIdentity').optional({ checkFalsy: true }).isString().withMessage('Gender Identity must be a string'),
        body('pronouns').optional({ checkFalsy: true }).isString().withMessage('Pronouns must be a string'),
        body('userType').not().isEmpty().withMessage('User type is required').isIn(['student', 'teacher', 'admin']).withMessage('Must be one of the following: student, teacher, admin'),
        body('photoUrl').optional({ checkFalsy: true }).isString().withMessage('Photo URL must be a string'),
        body('isArchived').optional({ checkFalsy: true }).isBoolean().withMessage('isArchived must be a boolean'),
    ];
};

const updateUserValidationRules = () => {
    return [
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Must be a valid email address').normalizeEmail(),
        body('password').optional({ checkFalsy: true }).isLength({ min: 4, max: 128 }).withMessage('Password must be at least 4 and at most 128 characters'),
        body('firstName').optional({ checkFalsy: true }).isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
        body('lastName').optional({ checkFalsy: true }).isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
        body('birthDate')
            .optional({ checkFalsy: true })
            .custom((value) => moment(value, 'YYYY-MM-DD', true).isValid())
            .withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        body('genderIdentity').optional({ checkFalsy: true }).isString().withMessage('Gender Identity must be a string'),
        body('pronouns').optional({ checkFalsy: true }).isString().withMessage('Pronouns must be a string'),
        body('userType').optional({ checkFalsy: true }).isIn(['student', 'teacher', 'admin']).withMessage('Must be one of the following: student, teacher, admin'),
        body('photoUrl').optional({ checkFalsy: true }).isString().withMessage('Photo URL must be a string'),
        body('isArchived').optional({ checkFalsy: true }).isBoolean().withMessage('isArchived must be a boolean'),
        //details validation
        body('studentDetails.gradYear').if((value, { req }) => req.body.studentDetails !== undefined)
            .optional().isInt().withMessage('Graduation year must be an integer'),

        body('teacherDetails.yearsExp').if((value, { req }) => req.body.teacherDetails !== undefined)
            .optional().isInt().withMessage('Years of experience must be an integer'),

        body('teacherDetails.bio').if((value, { req }) => req.body.teacherDetails !== undefined)
            .optional().isString().withMessage('Bio must be a string'),

        body('adminDetails.yearsExp').if((value, { req }) => req.body.adminDetails !== undefined)
            .optional().isInt().withMessage('Years of experience must be an integer'),

        body('adminDetails.bio').if((value, { req }) => req.body.adminDetails !== undefined)
            .optional().isString().withMessage('Bio must be a string'),
    ];
};

module.exports = {
    userValidationRules,
    updateUserValidationRules
}
