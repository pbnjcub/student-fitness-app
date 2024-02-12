const { body } = require('express-validator');
const moment = require('moment');

// Reusable functions for general field validation and custom logic
function validateField(fieldName, validationType, errorMessage, options = {}, isOptional = false) {
    const validator = body(fieldName);
    if (isOptional) {
        return validator.optional({ checkFalsy: true })[validationType](options).withMessage(errorMessage);
    }
    return validator[validationType](options).withMessage(errorMessage);
}

function customFieldValidation(fieldName, customLogic, isOptional = false) {
    const validator = body(fieldName);
    if (isOptional) {
        return validator.optional({ checkFalsy: true }).custom(customLogic);
    }
    return validator.custom(customLogic);
}
// Function to validate if details are present and of the correct type based on userType
function validateUserDetailsPresence(userType, detailKey) {
    return body(`${detailKey}`)
        .if((value, { req }) => req.body.userType === userType)
        .notEmpty().withMessage(`${detailKey} are required for userType ${userType}`)
        .bail()
        .isObject().withMessage(`${detailKey} must be an object`);
}

// Function to validate specific fields within user details
function validateDetailField(detailKey, field, validationType, errorMessage, conditionCallback) {
    return body(`${detailKey}.${field}`)
        .if((value, { req }) => conditionCallback(req))
        .optional()
        [validationType]().withMessage(errorMessage);
}

// Function to create a custom validator for specific conditions
function customValidationForDetails(detailKey, customValidationLogic) {
    return body(`${detailKey}`)
        .if((value, { req }) => req.body[detailKey] !== undefined)
        .custom(customValidationLogic);
}


const userValidationRules = () => {
    return [
        validateField('email', 'isEmail', 'Must be a valid email address', {}, false).normalizeEmail(),
        validateField('password', 'isLength', 'Password must be at least 4 and at most 128 characters', { min: 4, max: 128 }),
        validateField('firstName', 'isLength', 'First name must be at least 2 characters long', { min: 2 }),
        validateField('lastName', 'isLength', 'Last name must be at least 2 characters long', { min: 2 }),
        customFieldValidation('birthDate', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), false).withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        validateField('genderIdentity', 'isString', 'Gender Identity must be a string', {}, true),
        validateField('pronouns', 'isString', 'Pronouns must be a string', {}, true),
        validateField('userType', 'isIn', 'Must be one of the following: student, teacher, admin', ['student', 'teacher', 'admin']),
        validateField('photoUrl', 'isString', 'Photo URL must be a string', {}, true),
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}, true),
        
        validateUserDetailsPresence('student', 'studentDetails')
            .custom((studentDetails) => {
                if (typeof studentDetails.gradYear !== 'number' || studentDetails.gradYear == null) {
                    throw new Error('Graduation year is required and must be an integer');
                }
                return true;
            }),

        // Validate fields within teacherDetails if present
        validateDetailField('teacherDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.userType === 'teacher'),
        validateDetailField('teacherDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.teacherDetails !== undefined),

        // Validate fields within adminDetails if present
        validateDetailField('adminDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.adminDetails !== undefined),
        validateDetailField('adminDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.adminDetails !== undefined),

        // Directly apply custom validation for gradYear within studentDetails
        customValidationForDetails('studentDetails', (studentDetails) => {
            if (typeof studentDetails.gradYear !== 'number' || studentDetails.gradYear == null) {
                throw new Error('Graduation year is required and must be an integer');
            }
            return true;
        }),
    ];
};

const updateUserValidationRules = () => {
    return [
        validateField('email', 'isEmail', 'Must be a valid email address', {}, true).normalizeEmail(),
        validateField('password', 'isLength', 'Password must be at least 4 and at most 128 characters', { min: 4, max: 128 }, true),
        validateField('firstName', 'isLength', 'First name must be at least 2 characters long', { min: 2 }, true),
        validateField('lastName', 'isLength', 'Last name must be at least 2 characters long', { min: 2 }, true),
        customFieldValidation('birthDate', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), true).withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        validateField('genderIdentity', 'isString', 'Gender Identity must be a string', {}, true),
        validateField('pronouns', 'isString', 'Pronouns must be a string', {}, true),
        validateField('userType', 'isIn', 'Must be one of the following: student, teacher, admin', ['student', 'teacher', 'admin'], true),
        validateField('photoUrl', 'isString', 'Photo URL must be a string', {}, true),
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}, true),
        
        // For detail fields, apply conditional validation as optional
        customValidationForDetails('studentDetails', (studentDetails) => {
            if (studentDetails && (typeof studentDetails.gradYear !== 'number' || studentDetails.gradYear == null)) {
                throw new Error('Graduation year is required and must be an integer');
            }
            return true; // Return true to indicate successful validation
        }),
        
        // Applying optional validation for teacher and admin details similarly
        validateDetailField('teacherDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.teacherDetails !== undefined, true),
        validateDetailField('teacherDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.teacherDetails !== undefined, true),
        validateDetailField('adminDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.adminDetails !== undefined, true),
        validateDetailField('adminDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.adminDetails !== undefined, true),
    ];
};


const sectionValidationRules = () => {
    return [
        validateField('sectionCode', 'isLength', 'Section code must be between 2 and 10 characters in length', { min: 2, max: 10 }),
        validateField('gradeLevel', 'isIn', 'Grade level must be either "6", "7", "8", "9", or "10-11-12"', ['6', '7', '8', '9', '10-11-12']),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean', {}),
    ];
}

module.exports = {
    userValidationRules,
    updateUserValidationRules,
    sectionValidationRules
}
