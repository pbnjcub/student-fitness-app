const Sequelize = require('sequelize');
const { UserDetailUpdateError } = require('./CustomErrors');

const errorHandler = (err, req, res, next) => {
    const formatError = (field, message) => ({ field, message });

    let statusCode = err.status || 500;
    let errorResponse;

    if (Array.isArray(err)) {
        return res.status(422).json({ errs: err });
    }

    if (err.message) {

        // User-related errors
        if (err.message === "User already exists.") {
            errorResponse = formatError('user', err.message);
            statusCode = 409;
        } else if (err.message.includes('User with email')) {
            errorResponse = formatError('email', err.message);
            statusCode = 409;
        } else if (err.message === "Invalid user type") {
            errorResponse = formatError('userType', err.message);
            statusCode = 400;
        } else if (err.message === "Invalid or missing graduation year for student") {
            errorResponse = formatError('graduationYear', err.message);
            statusCode = 400;
        } else if (err.message === "Missing student details") {
            errorResponse = formatError('studentDetails', err.message);
            statusCode = 400;
        } else if (err.message === "Student is rostered in a section and cannot be archived.") {
            errorResponse = formatError('isArchived', err.message);
            statusCode = 400;
        } else if (err instanceof UserDetailUpdateError) {
            errorResponse = formatError('userType', err.message);
            statusCode = 400;

        // Section-related errors
        } else if (err.message.includes('Section with ID')) {
            errorResponse = formatError('sectionId', err.message);
            statusCode = 404;
        } else if (err.message === "Section already exists.") {
            errorResponse = formatError('sectionCode', err.message);
            statusCode = 409;
        } else if (err.message.includes("Section with section code")) {
            errorResponse = formatError('sectionCode', err.message);
            statusCode = 409;
        } else if (err.message.includes('Section ID must be an integer')) {
            errorResponse = formatError('sectionId', err.message);
            statusCode = 400;
        } else if (err.message.includes('Error checking section existence')) {
            errorResponse = formatError('section', err.message);
            statusCode = 500;
        } else if (err.message.includes('Section code must be 7 characters')) {
            errorResponse = formatError('sectionCode', err.message);
            statusCode = 400;
        } else if (err.message.includes('Duplicate section codes found')) {
            errorResponse = formatError('sectionCode', err.message);
            statusCode = 400;
        } else if (err.message.includes('is not active')) {
            errorResponse = formatError('section', err.message);
            statusCode = 400;
        } else if (err.message.includes('cannot change isActive status')) {
            errorResponse = formatError('isActive', err.message);
            statusCode = 400;

        // General errors
        } else if (err.message.includes('not found')) {
            errorResponse = formatError('general', err.message);
            statusCode = 404;
        } else if (err instanceof Sequelize.ValidationError) {
            errorResponse = err.errors.map(e => formatError(e.path, e.message));
            statusCode = 400;
        } else if (err instanceof Sequelize.DatabaseError) {
            errorResponse = formatError('database', 'Database error occurred');
            statusCode = 500;
        } else {
            errorResponse = formatError('general', 'Internal Server Error');
            statusCode = 500;
        }
    } else {
        errorResponse = formatError('general', 'Internal Server Error');
    }

    return res.status(statusCode).json({ errs: Array.isArray(errorResponse) ? errorResponse : [errorResponse] });
};

module.exports = errorHandler;
