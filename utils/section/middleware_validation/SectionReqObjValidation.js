const { body } = require('express-validator');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');

// Section validation rules
const createSectionValidationRules = () => {
    return [
        customFieldValidation('sectionCode', (value) => {
            console.log(`Validating sectionCode: ${value}`);
            const regex = /^\d{4}-\d{2}$/;
            if (!regex.test(value)) {
                throw new Error('Section code must be 7 characters in length and in the format "nnnn-nn" where n is a number');
            }
            return true;
        }),

        validateField('gradeLevel', 'isIn', 'Grade level must be either "6", "7", "8", "9", or "10-11-12"', ['6', '7', '8', '9', '10-11-12']),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean'),
    ];
};

// Update section validation rules
const updateSectionValidationRules = () => {
    return [
        customFieldValidation('sectionCode', (value) => {
            console.log(`Validating sectionCode: ${value}`);
            const regex = /^\d{4}-\d{2}$/;
            if (!regex.test(value)) {
                throw new Error('Section code must be 7 characters in length and in the format "nnnn-nn" where n is a number');
            }
            return true;
        }, true),
        validateField('gradeLevel', 'isIn', 'Grade level must be either "6", "7", "8", "9", or "10-11-12"', ['6', '7', '8', '9', '10-11-12'], true),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean', true),
        // customFieldValidation('isActive', (value) => {
        //     console.log(`Validating isActive: ${value}`);
        //     if (typeof value !== 'boolean') {
        //         throw new Error('isActive must be a boolean');
        //     }
        //     return true;
        // }, true)
    ];
};

module.exports = { createSectionValidationRules, updateSectionValidationRules };
