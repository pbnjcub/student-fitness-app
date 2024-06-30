const { body } = require('express-validator');
const { validateField, customFieldValidation } = require('../../validation/CommonValidationFunctions');

// create module validation rules
const createModuleValidationRules = () => {
    return [
        validateField('title', 'isLength', 'Module title must be between 1 and 50 characters in length', { min: 1, max: 50 }),
        // customFieldValidation('title', (value) => {
        //     if (!value) {
        //         throw new Error('Title is required');
        //     }
        //     return true;
        // }),
        validateField('moduleLevel', 'isIn', 'Module level must be either "upper school", "middle school", or "lower school"', ['upper school', 'middle school', 'lower school']),
        // customFieldValidation('moduleLevel', (value) => {
        //     if (!value) {
        //         throw new Error('Module level is required');
        //     }
        //     return true;
        // }),
        validateField('description', 'isLength', 'Module description must be between 1 and 250 characters in length', { min: 1, max: 250 }, true),
        // customFieldValidation('description', (value) => {
        //     if (!value) {
        //         throw new Error('Description is required');
        //     }
        //     return true;
        // }),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean', {}),
        // customFieldValidation('isActive', (value) => {
        //     if (typeof value !== 'boolean') {
        //         throw new Error('isActive must be a boolean');
        //     }
        //     return true;
        // })
    ];
};

// update module validation rules
const updateModuleValidationRules = () => {
    return [
        validateField('title', 'isLength', 'Module title must be between 1 and 50 characters in length', { min: 1, max: 50 }, true),
        // customFieldValidation('title', (value) => {
        //     if (!value) {
        //         throw new Error('Title is required');
        //     }
        //     return true;
        // }, true),
        validateField('moduleLevel', 'isIn', 'Module level must be either "upper school", "middle school", or "lower school"', ['upper school', 'middle school', 'lower school'], true),
        // customFieldValidation('moduleLevel', (value) => {
        //     if (!value) {
        //         throw new Error('Module level is required');
        //     }
        //     return true;
        // }, true),
        validateField('description', 'isLength', 'Module description must be between 1 and 250 characters in length', { min: 1, max: 250 }, true),
        // customFieldValidation('description', (value) => {
        //     if (!value) {
        //         throw new Error('Description is required');
        //     }
        //     return true;
        // }, true),
        validateField('isActive', 'isBoolean', 'isActive must be a boolean', {}, true),
        // customFieldValidation('isActive', (value) => {
        //     if (typeof value !== 'boolean') {
        //         throw new Error('isActive must be a boolean');
        //     }
        //     return true;
        // }, true)
    ];
};

module.exports = { createModuleValidationRules, updateModuleValidationRules };