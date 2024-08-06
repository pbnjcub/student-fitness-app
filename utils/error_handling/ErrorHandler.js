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
        switch (true) {
            case err.message === "User already exists.":
                errorResponse = formatError('user', err.message);
                statusCode = 409;
                break;
            case err.message.includes('User with email'):
                errorResponse = formatError('email', err.message);
                statusCode = 409;
                break;
            case err.message === "Invalid user type":
                errorResponse = formatError('userType', err.message);
                statusCode = 400;
                break;
            case err.message === "Invalid or missing graduation year for student":
                errorResponse = formatError('graduationYear', err.message);
                statusCode = 400;
                break;
            case err.message === "Missing student details":
                errorResponse = formatError('studentDetails', err.message);
                statusCode = 400;
                break;
            case err.message === "Student is rostered in a section and cannot be archived.":
                errorResponse = formatError('isArchived', err.message);
                statusCode = 400;
                break;
            case err.message.includes('Student with email'):
                errorResponse = formatError('email', err.message);
                break;
            case err instanceof UserDetailUpdateError:
                errorResponse = formatError('userType', err.message);
                statusCode = 400;
                break;

            // Section-related errors
            case err.message.includes('Section with ID'):
                errorResponse = formatError('sectionId', err.message);
                statusCode = 404;
                break;
            case err.message === "Section already exists.":
                errorResponse = formatError('sectionCode', err.message);
                statusCode = 409;
                break;
            case err.message.includes("Section with section code"):
                errorResponse = formatError('sectionCode', err.message);
                statusCode = 409;
                break;
            case err.message.includes('Section ID must be an integer'):
                errorResponse = formatError('sectionId', err.message);
                statusCode = 400;
                break;
            case err.message.includes('Error checking section existence'):
                errorResponse = formatError('section', err.message);
                statusCode = 500;
                break;
            case err.message.includes('Section code must be 7 characters'):
                errorResponse = formatError('sectionCode', err.message);
                statusCode = 400;
                break;
            case err.message.includes('Duplicate section codes found'):
                errorResponse = formatError('sectionCode', err.message);
                statusCode = 400;
                break;
            case err.message.includes('is not active'):
                errorResponse = formatError('section', err.message);
                statusCode = 400;
                break;
            case err.message.includes('already rostered in section'):
                errorResponse = formatError('email', err.message);
                statusCode = 409;
                break;
            case err.message.includes('Duplicate emails found'):
                errorResponse = formatError('email', err.message);
                statusCode = 400;
                break;
            case err.message.includes('cannot change isActive status'):
                errorResponse = formatError('isActive', err.message);
                statusCode = 400;
                break;

            // General errors
            case err.message.includes('not found'):
                errorResponse = formatError('general', err.message);
                statusCode = 404;
                break;
            case err instanceof Sequelize.ValidationError:
                errorResponse = err.errors.map(e => formatError(e.path, e.message));
                statusCode = 400;
                break;
            case err instanceof Sequelize.DatabaseError:
                errorResponse = formatError('database', 'Database error occurred');
                statusCode = 500;
                break;
            default:
                errorResponse = formatError('general', 'Internal Server Error');
                statusCode = 500;
                break;
        }
    } else {
        errorResponse = formatError('general', 'Internal Server Error');
    }

    // Log the error if necessary
    console.error(err.stack);

    return res.status(statusCode).json({ errs: Array.isArray(errorResponse) ? errorResponse : [errorResponse] });
};

module.exports = errorHandler;
