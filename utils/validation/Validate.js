// validationMiddleware.js
const { validationResult } = require('express-validator');
const { formatError } = require('../error_handling/ErrorHandler');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        console.log('No validation errors found');
        return next();
    }

    // Map errors to formatError and pass them to next(err) to invoke errorHandler
    const extractedErrors = errors.array().map(err => formatError(err.path, err.msg));

    // Pass extractedErrors to the next function as an array of errors
    return next(extractedErrors);
};

module.exports = validate;

