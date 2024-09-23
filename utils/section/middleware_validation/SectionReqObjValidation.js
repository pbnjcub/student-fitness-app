const { body } = require('express-validator');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');

// Section validation rules
const createSectionsValidationRules = () => {
    return [
        body('sections').custom((value) => {
            if (!Array.isArray(value)) {
                value = [value]; // If a single section, convert to array
            }
            value.forEach((section, index) => {
                // Validate sectionCode
                if (!/^\d{4}-\d{2}$/.test(section.sectionCode)) {
                    throw new Error(`Section code at index ${index} must be in the format "nnnn-nn"`);
                }
                // Validate gradeLevel
                const validGrades = ['6', '7', '8', '9', '10-11-12'];
                if (!validGrades.includes(section.gradeLevel)) {
                    throw new Error(`Grade level at index ${index} must be one of: ${validGrades.join(', ')}`);
                }
                // Validate isActive
                if (typeof section.isActive !== 'boolean') {
                    throw new Error(`isActive at index ${index} must be a boolean`);
                }
            });
            return true;
        }),
    ];
};

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
    ];
};

module.exports = { createSectionsValidationRules, createSectionValidationRules, updateSectionValidationRules };
