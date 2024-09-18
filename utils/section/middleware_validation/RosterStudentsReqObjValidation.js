const { body } = require('express-validator');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');

// Section validation rules
const rosterStudentsValidationRules = () => [
    customFieldValidation('studentUserIds', (value) => {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error('studentUserIds must be a non-empty array');
        }
        value.forEach(id => {
            if (!Number.isInteger(id)) {
                throw new Error('Each studentUserId must be an integer');
            }
        });
        return true;
    }),
];

module.exports = rosterStudentsValidationRules;
