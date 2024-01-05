const { body } = require('express-validator');

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
        body('password').isLength({ min: 4, max: 128 }).withMessage('Password must be at least 4 and at most 128 characters'),
        body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
        body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
        body('birthDate').not().isEmpty().withMessage('Birth date is required').isDate().withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        body('genderIdentity').optional({ checkFalsy: true }).isString().withMessage('Gender Identity must be a string'),
        body('pronouns').optional({ checkFalsy: true }).isString().withMessage('Pronouns must be a string'),
        body('userType').not().isEmpty().withMessage('User type is required').isIn(['student', 'teacher', 'admin']).withMessage('Must be one of the following: student, teacher, admin'),
        body('photoUrl').optional({ checkFalsy: true }).isString().withMessage('Photo URL must be a string'),
        body('isArchived').optional({ checkFalsy: true }).isBoolean().withMessage('isArchived must be a boolean'),
    ];
};

module.exports = {
    userValidationRules
}
