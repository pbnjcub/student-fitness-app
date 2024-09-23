const { param } = require('express-validator');

const deleteSectionValidationRules = () => [
    param('sectionId').isInt().withMessage('sectionId must be an integer')
];

module.exports = deleteSectionValidationRules;