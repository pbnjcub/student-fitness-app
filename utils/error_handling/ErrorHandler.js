const Sequelize = require('sequelize');
const { UserDetailUpdateError } = require('./CustomErrors');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Handle array of errors
    if (Array.isArray(err)) {
        return res.status(422).json({ errs: err });
    }

    // Function to format errors
    const formatError = (field, message) => ({
        field,
        message
    });

    // Determine appropriate status code
    let statusCode = err.status || 500;

    // Map error messages to the consistent format
    let errorResponse;
    if (err.message) {
        switch (err.message) {
            case "User already exists.":
                errorResponse = formatError('user', err.message);
                statusCode = 409;
                break;
            case "Invalid user type":
                errorResponse = formatError('userType', err.message);
                statusCode = 400;
                break;
            case "Invalid or missing graduation year for student":
                errorResponse = formatError('graduationYear', err.message);
                statusCode = 400;
                break;
            case "Missing student details":
                errorResponse = formatError('studentDetails', err.message);
                statusCode = 400;
                break;
            default:
                // Handle Sequelize validation errors
                if (err instanceof Sequelize.ValidationError) {
                    errorResponse = err.errors.map(e => formatError(e.path, e.message));
                    statusCode = 400;
                    break;
                }

                // Handle other specific errors
                if (err.message.includes('not found')) {
                    errorResponse = formatError('general', err.message);
                    statusCode = 404;
                    break;
                }

                if (err.message.includes('Section with ID')) {
                    errorResponse = formatError('sectionId', err.message);
                    statusCode = 404;
                    break;
                }

                if (err.message === "Section already exists.") {
                    errorResponse = formatError('sectionCode', err.message);
                    statusCode = 409;
                    break;
                }

                if (err.message.includes("Section with section code")) {
                    errorResponse = formatError('sectionCode', err.message);
                    statusCode = 409;
                    break;
                }

                if (err.message.includes('Section ID must be an integer')) {
                    errorResponse = formatError('sectionId', err.message);
                    statusCode = 400;
                    break;
                }

                if (err.message.includes('Error checking section existence')) {
                    errorResponse = formatError('section', err.message);
                    statusCode = 500;
                    break;
                }

                if (err.message.includes('Section code must be 7 characters')) {
                    errorResponse = formatError('sectionCode', err.message);
                    statusCode = 400;
                    break;
                }

                if (err.message.includes('is not active')) {
                    errorResponse = formatError('section', err.message);
                    statusCode = 400;
                    break;
                }

                if (err.message.includes('cannot change isActive status')) {
                    errorResponse = formatError('isActive', err.message);
                    statusCode = 400;
                    break;
                }

                // Handle Sequelize database errors
                if (err instanceof Sequelize.DatabaseError) {
                    errorResponse = formatError('database', 'Database error occurred');
                    statusCode = 500;
                    break;
                }

                if (err instanceof UserDetailUpdateError) {
                    errorResponse = formatError('userType', err.message);
                    statusCode = 400;
                    break;
                }

                // Handle other errors
                errorResponse = formatError('general', 'Internal Server Error');
                statusCode = 500;
                break;
        }
    } else {
        errorResponse = formatError('general', 'Internal Server Error');
    }

    return res.status(statusCode).json({ errs: Array.isArray(errorResponse) ? errorResponse : [errorResponse] });
};

module.exports = errorHandler;
