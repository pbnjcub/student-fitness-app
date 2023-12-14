const { body } = require('express-validator');

const userValidationRules = () => {
    return [
        // username must be an email
        body('email').isEmail().withMessage('Must be a valid email address')
            .normalizeEmail(),
        // password must be at least 6 chars long
        body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 and at most 128 characters'),
        // firstName must be at least 2 chars long
        body('firstName')
            .not().isEmpty().withMessage('First name is required'),
        // lastName must be at least 2 chars long
        body('lastName')
            .not().isEmpty().withMessage('Last name is required'),
        // birthDate must be a date
        body('birthDate')
            .not().isEmpty().withMessage('Birth date is required'),
            // .isDate().withMessage('Birth date must be a valid date'),
        // genderIdentity must be a string
        body('genderIdentity')
            .optional({ checkFalsy: true }).isString().withMessage('Gender Identity must be a string'),
        // pronouns must be a string
        body('pronouns')
            .optional({ checkFalsy: true }).isString().withMessage('Pronouns must be a string'),
        // userType must be one of the following: student, teacher, admin
        body('userType')
            .isIn(['student', 'teacher', 'admin']).withMessage('Must be one of the following: student, teacher, admin'),
        
        // photoUrl must be a string
        body('photoUrl')
            .optional({ checkFalsy: true }).isString().withMessage('Photo URL must be a string'),
    ];
};

module.exports = {
    userValidationRules
}
