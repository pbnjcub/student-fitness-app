const { body } = require('express-validator');
const moment = require('moment');
const { validateField, customFieldValidation, validateUserDetailsPresence, roleBasedValidation, validateDetailField, customValidationForDetails } = require('../../validation/CommonValidationFunctions');

// User validation rules for creation
const createUserValidationRules = () => {
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
        validateField('isArchived', 'isBoolean', 'isArchived must be a boolean', {}, true),
        validateUserDetailsPresence('student', 'studentDetails'),
        roleBasedValidation('student', 'studentDetails', 'gradYear', 'isInt', 'Graduation year must be an integer', {}, false),
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
