const { body } = require('express-validator');
const moment = require('moment');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');

// Validation rules for creating an anthro object
const createAnthroValidationRules = () => {
    return [
        validateField('height', 'isFloat', 'Height must be a valid number greater than zero', { min: 0.01 }, true),
        validateField('weight', 'isFloat', 'Weight must be a valid number greater than zero', { min: 0.01 }, true),

        // validate that teacherUserId is an integer
        validateField('teacherUserId', 'isInt', 'Teacher ID must be an integer', {}),
        // validatedateRecorded is a date and is in the correct format
        customFieldValidation('dateRecorded', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), false).withMessage('Date recorded must be valid or in the following format (YYYY-MM-DD)'),
        
    ];
};

// Validation rules for editing an anthro object
const updateAnthroValidationRules = () => {
    return [
        validateField('height', 'isFloat', 'Height must be a valid number greater than zero', { min: 0.01 }, true),
        validateField('weight', 'isFloat', 'Weight must be a valid number greater than zero', { min: 0.01 }, true),
        // validate that teacherUserId is an integer
        validateField('teacherUserId', 'isInt', 'Teacher ID must be an integer', {}, true),
        // validatedateRecorded is a date and is in the correct format
        customFieldValidation('dateRecorded', (value) => moment(value, 'YYYY-MM-DD', true).isValid(), true).withMessage('Date recorded must be valid or in the following format (YYYY-MM-DD)'),
    ];
};

module.exports = { 
    createAnthroValidationRules,
    updateAnthroValidationRules
};
