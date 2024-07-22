const { body } = require('express-validator');

function validateField(fieldName, validationType, errorMessage, options = {}, isOptional = false) {

    const validator = body(fieldName);
    
    if (isOptional) {
        return validator.optional({ checkFalsy: true })[validationType](options).withMessage(errorMessage);
    }

    return validator[validationType](options).withMessage(errorMessage);
}

function customFieldValidation(fieldName, customLogic, isOptional = false) {
    const validator = body(fieldName);
    if (isOptional) {
        return validator.optional({ checkFalsy: true }).custom(customLogic);
    }
    return validator.custom(customLogic);
}

function validateUserDetailsPresence(userType, detailKey) {
    return body(`${detailKey}`)
        .if((value, { req }) => req.body.userType === userType)
        .notEmpty().withMessage(`${detailKey} are required for userType ${userType}`)
        .bail()
        .custom((value) => {
            if (typeof value !== 'object' || value === null) {
                throw new Error(`${detailKey} must be an object`);
            }
            return true;
        });
}

function customValidationForDetails(detailKey, customValidationLogic) {
    return body(`${detailKey}`)
        .if((value, { req }) => req.body[detailKey] !== undefined)
        .custom(customValidationLogic);
}

function validateDetailField(detailKey, field, validationType, errorMessage, conditionCallback, options = {}) {
    return body(`${detailKey}.${field}`)
        .if((value, { req }) => conditionCallback(req))
        .optional({ checkFalsy: true }) 
        [validationType](options).withMessage(errorMessage);
}

function roleBasedValidation(userType, detailKey, fieldName, validationType, errorMessage, options = {}, isOptional = false) {
    return body(`${detailKey}.${fieldName}`)
        .if((value, { req }) => req.body.userType === userType)
        .custom((value, { req }) => {
            if (isOptional && (value === undefined || value === '')) {
                return true;
            }
            switch (validationType) {
                case 'isInt':
                    if (!Number.isInteger(value)) {
                        throw new Error(errorMessage);
                    }
                    break;
                case 'isString':
                    if (typeof value !== 'string') {
                        throw new Error(errorMessage);
                    }
                    break;
                default:
                    break;
            }
            return true;
        });
}

module.exports = {
    validateField,
    customFieldValidation,
    validateUserDetailsPresence,
    customValidationForDetails,
    validateDetailField,
    roleBasedValidation
};
