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
        .if((value, { req }) => {
            const condition = req.body.userType === userType;
            return condition;
        })
        .notEmpty().withMessage(`${detailKey} are required for userType ${userType}`)
        .bail()
        .custom((value, { req }) => {
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

// Adjusted function to validate if details are present and of the correct type based on userType
// This function already handles making studentDetails not optional for students.
// No change needed here, but ensure it's correctly implemented in the userValidationRules.

// Adjust the validateDetailField function to conditionally apply validations based on userType
function validateDetailField(detailKey, field, validationType, errorMessage, conditionCallback, options = {}) {
    return body(`${detailKey}.${field}`)
        .if((value, { req }) => conditionCallback(req))
        .optional({ checkFalsy: true }) // Making it optional but conditionally validating
        [validationType](options).withMessage(errorMessage);
}

// Use a more specific function for handling role-based conditional validations
function roleBasedValidation(userType, detailKey, fieldName, validationType, errorMessage, options = {}, isOptional = false) {

    // Directly construct and return the validation rule based on the inputs without checking validateUserDetailsPresence
    return body(`${detailKey}.${fieldName}`)
        .if((value, { req }) => req.body.userType === userType) // Ensure this validation applies only for the specified userType
        .custom((value, { req }) => {
            if (isOptional && (value === undefined || value === '')) {
                // If the field is optional and not provided, pass the validation
                return true;
            }

            // Apply specific validation based on the validationType
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
                // Include other cases as necessary
            }

            return true; // Indicate that the validation passed
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
        validateField('userType', 'isIn', 'Must be one of the following: student, teacher, admin', ['student', 'teacher', 'admin']),
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
