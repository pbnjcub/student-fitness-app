const { body } = require('express-validator');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');


const transferStudentsValidationRules = () => {
    return [
        // Validate that fromSectionId is an integer
        validateField('fromSectionId', 'isInt', 'fromSectionId must be an integer'),

        // Validate that toSectionId is an integer
        validateField('toSectionId', 'isInt', 'toSectionId must be an integer'),

        // Validate that studentIds is an array of integers
        customFieldValidation('studentIds', (value) => {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error('studentIds must be a non-empty array');
            }

            if (!value.every(Number.isInteger)) {
                throw new Error('Each student ID must be an integer');
            }

            return true;
        }),
    ];
};

module.exports = transferStudentsValidationRules;