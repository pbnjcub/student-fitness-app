const { customFieldValidation } = require('../../validation/CommonValidationFunctions');
const { param } = require('express-validator');

const rosterStudentsValidationRules = () => [
    param('sectionId').isInt().withMessage('sectionId must be an integer'),
    
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
    })


];

module.exports = rosterStudentsValidationRules;
