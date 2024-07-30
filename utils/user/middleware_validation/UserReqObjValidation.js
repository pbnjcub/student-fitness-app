const { body } = require('express-validator');
const moment = require('moment');
const { validateField, customFieldValidation, validateUserDetailsPresence, roleBasedValidation, validateDetailField, customValidationForDetails } = require('../../validation/CommonValidationFunctions');

// User validation rules for creation
const createUserValidationRules = () => {
    const currentYear = new Date().getFullYear();
    return [
        validateField('email', 'isEmail', 'Must be a valid email address', {}, false).normalizeEmail(),
        validateField('password', 'isLength', 'Password must be at least 4 and at most 128 characters', { min: 4, max: 128 }),
        validateField('firstName', 'isLength', 'First name must be at least 2 characters long', { min: 2 }),
        validateField('lastName', 'isLength', 'Last name must be at least 2 characters long', { min: 2 }),
        customFieldValidation('birthDate', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), false).withMessage('Birth date must be valid or in the following format (YYYY-MM-DD)'),
        validateField('genderIdentity', 'isString', 'Gender Identity must be a string', {}, true),
        validateField('pronouns', 'isString', 'Pronouns must be a string', {}, true),
        customFieldValidation('userType', (value) => {
            if (typeof value !== 'string' || value.trim() === "") {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            if (!['student', 'teacher', 'admin'].includes(value)) {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            return true;
        }),
        validateField('photoUrl', 'isString', 'Photo URL must be a string', {}, true),
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}),
        customFieldValidation('dateArchived', (value, { req }) => {
            // Ensure dateArchived is empty or null when isArchived is false
            if (!req.body.isArchived && (value !== undefined && value !== "" && value !== null)) {
                throw new Error('dateArchived must be empty when isArchived is false');
            }
            // Ensure dateArchived is present and valid when isArchived is true
            if (req.body.isArchived) {
                if (!value || value === "") {
                    throw new Error('dateArchived is required when isArchived is true');
                }
                if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
                    throw new Error('dateArchived must be a valid date in the format YYYY-MM-DD');
                }
            }
            return true;
        }),
        validateUserDetailsPresence('student', 'studentDetails'),
        roleBasedValidation('student', 'studentDetails', 'gradYear', 'isInt', 'Graduation year must be an integer', {}, false)
            .bail()
            .custom((value) => {
                if (value < 1900 || value > currentYear) {
                    throw new Error(`Graduation year must be between 1900 and ${currentYear}`);
                }
                return true;
            }),
        roleBasedValidation('teacher', 'teacherDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', {}, true),
        roleBasedValidation('teacher', 'teacherDetails', 'bio', 'isString', 'Bio must be a string', {}, true),
        roleBasedValidation('admin', 'adminDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', {}, true),
        roleBasedValidation('admin', 'adminDetails', 'bio', 'isString', 'Bio must be a string', {}, true),
    ];
};

// User validation rules for updating
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
            if (typeof value !== 'string' || value.trim() === "") {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            if (!['student', 'teacher', 'admin'].includes(value)) {
                throw new Error('Must be one of the following: student, teacher, admin');
            }
            return true;
        }, true),
        validateField('photoUrl', 'isString', 'Photo URL must be a string', {}, true),
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}, true),
        customValidationForDetails('studentDetails', (studentDetails) => {
            if (studentDetails && (typeof studentDetails.gradYear !== 'number' || studentDetails.gradYear == null)) {
                throw new Error('Graduation year is required and must be an integer');
            }
            return true; // Return true to indicate successful validation
        }),
        validateDetailField('teacherDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.teacherDetails !== undefined, true),
        validateDetailField('teacherDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.teacherDetails !== undefined, true),
        validateDetailField('adminDetails', 'yearsExp', 'isInt', 'Years of experience must be an integer', req => req.body.adminDetails !== undefined, true),
        validateDetailField('adminDetails', 'bio', 'isString', 'Bio must be a string', req => req.body.adminDetails !== undefined, true),
    ];
};

module.exports = { createUserValidationRules, updateUserValidationRules };
