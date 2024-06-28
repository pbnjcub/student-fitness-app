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

// function to validate custom logic
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
        .custom((value) => {
            if (typeof value !== 'object' || value === null) {
                throw new Error(`${detailKey} must be an object`);
            }
            return true;
        });
}

// Function to create a custom validator for specific conditions
function customValidationForDetails(detailKey, customValidationLogic) {
    return body(`${detailKey}`)
        .if((value, { req }) => req.body[detailKey] !== undefined)
        .custom(customValidationLogic);
}

// Adjust the validateDetailField function to conditionally apply validations based on userType
function validateDetailField(detailKey, field, validationType, errorMessage, conditionCallback, options = {}) {
    return body(`${detailKey}.${field}`)
        .if((value, { req }) => conditionCallback(req))
        .optional({ checkFalsy: true }) 
        [validationType](options).withMessage(errorMessage);
}

// Use a more specific function for handling role-based conditional validations
function roleBasedValidation(userType, detailKey, fieldName, validationType, errorMessage, options = {}, isOptional = false) {
    return body(`${detailKey}.${fieldName}`)
        .if((value, { req }) => req.body.userType === userType)
        .custom((value, { req }) => {
            if (isOptional && (value === undefined || value === '')) {
                return true;
            }
            switch (validationType) {
                case 'isInt':
                    if (!Number.isInteger(value)) {
                        throw new Error(errorMessage);
                    }
                    break;
                case 'isString':
                    if (typeof value !== 'string') {
                        throw new Error(errorMessage);
                    }
                    break;
                default:
                    break;
            }
            return true;
        });
}

//validation rules
const userValidationRules = () => {
    return [
        validateField('email', 'isEmail', 'Must be a valid email address', {}, false).normalizeEmail(),
        validateField('password', 'isLength', 'Password must be at least 4 and at most 128 characters', { min: 4, max: 128 }),
        validateField('firstName', 'isLength', 'First name must be at least 2 characters long', { min: 2 }),
        validateField('lastName', 'isLength', 'Last name must be at least 2 characters long', { min: 2 }),
        customFieldValidation('birthDate', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), false).withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        validateField('genderIdentity', 'isString', 'Gender Identity must be a string', {}, true),
        validateField('pronouns', 'isString', 'Pronouns must be a string', {}, true),
        customFieldValidation('userType', (value) => {
            if (typeof value !== 'string' || value.trim === "") {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            if (!['student', 'teacher', 'admin'].includes(value)) {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            return true;
        }),
        validateField('photoUrl', 'isString', 'Photo URL must be a string', {}, true),
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}, true),
        validateUserDetailsPresence('student', 'studentDetails'),

        roleBasedValidation('student', 'studentDetails', 'gradYear', 'isInt', 'Graduation year must be an integer', {}, false),
        roleBasedValidation('teacher', 'teacherDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', {}, true),
        roleBasedValidation('teacher', 'teacherDetails', 'bio', 'isString', 'Bio must be a string', {}, true),
        roleBasedValidation('admin', 'adminDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', {}, true),
        roleBasedValidation('admin', 'adminDetails', 'bio', 'isString', 'Bio must be a string', {}, true),
    ];
};

//update user validation rules
const updateUserValidationRules = () => {
    return [
        validateField('email', 'isEmail', 'Must be a valid email address', {}, true).normalizeEmail(),
        validateField('password', 'isLength', 'Password must be at least 4 and at most 128 characters', { min: 4, max: 128 }, true),
        validateField('firstName', 'isLength', 'First name must be at least 2 characters long', { min: 2 }, true),
        validateField('lastName', 'isLength', 'Last name must be at least 2 characters long', { min: 2 }, true),
        customFieldValidation('birthDate', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), true).withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        validateField('genderIdentity', 'isString', 'Gender Identity must be a string', {}, true),
        validateField('pronouns', 'isString', 'Pronouns must be a string', {}, true),
        customFieldValidation('userType', (value) => {
            // Check for empty string or string with only spaces
            if (typeof value !== 'string' || value.trim === "") {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            if (!['student', 'teacher', 'admin'].includes(value)) {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            return true;
        }, true),
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

// Validation rules for section
const sectionValidationRules = () => {
    return [
        // Assuming validateField supports a custom validation for format (pseudocode)
        validateField('sectionCode', 'isLength', 'Section code must be 7 characters in length and in the format "nnnn-nn" where n is a number', { min: 7, max: 7 }),
        validateField('gradeLevel', 'isIn', 'Grade level must be either "6", "7", "8", "9", or "10-11-12"', ['6', '7', '8', '9', '10-11-12']),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean', {}),
    ];
};

const updateSectionValidationRules = () => {
    return [
        validateField('sectionCode', 'isLength', 'Section code must be 7 characters in length and in the format "nnnn-nn" where n is a number', { min: 7, max: 7 }, true),
        customFieldValidation('sectionCode', (value) => {
            const regex = /^\d{4}-\d{2}$/;
            if (!regex.test(value)) {
                throw new Error('Section code must be 7 characters in length and in the format \"nnnn-nn\" where n is a number');
            }
            return true;
        }, true),
        validateField('gradeLevel', 'isIn', 'Grade level must be either "6", "7", "8", "9", or "10-11-12"', ['6', '7', '8', '9', '10-11-12'], true),
        customFieldValidation('isActive', (value) => {
            if (typeof value !== 'boolean') {
                throw new Error('isActive must be a boolean');
            }
            return true;
        }, true),
    ];
};

module.exports = {
    userValidationRules,
    updateUserValidationRules,
    sectionValidationRules,
    updateSectionValidationRules
}
