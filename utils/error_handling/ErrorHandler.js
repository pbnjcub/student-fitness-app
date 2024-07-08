const Sequelize = require('sequelize');
const { UserDetailUpdateError } = require('./CustomErrors');

const errorHandler = (err, req, res, next) => {

    console.error(err);

    if (Array.isArray(err)) {
        return res.status(422).json({ errs: err });
    }

    // USER ROUTE ERRORS
    if (err.message) {
        // Check for user already exists error
        if (err.message === "User already exists.") {
            return res.status(409).json({ err: err.message });
        }

        // Check for invalid user type error
        else if (err.message === "Invalid user type") {
            return res.status(400).json({ err: err.message });
        }

        // Check for invalid or missing graduation year
        else if (err.message.includes("Invalid or missing graduation year for student")) {
            return res.status(400).json({ err: err.message });
        }

        // Check for missing student details
        else if (err.message.includes("Missing student details")) {
            return res.status(400).json({ err: err.message });
        }

        // Handle Sequelize validation errors
        else if (err instanceof Sequelize.ValidationError) {
            return res.status(400).json({ errs: err.errors.map(e => ({ [e.path]: e.message })) });
        }

        // Check for "User Not Found" error
        else if (err.message.includes('not found')) {
            return res.status(404).json({ err: err.message });
        }

        // SECTION ROUTE ERRORS
        // Check for "Section Not Found" error
        else if (err.message.includes('Section with ID')) {
            return res.status(404).json({ err: err.message });
        }

        // Check for section already exists error
        else if (err.message === "Section already exists.") {
            return res.status(409).json({ err: err.message });
        }

        // Check if section code already exists
        else if (err.message.includes("Section with section code")) {
            return res.status(409).json({ err: err.message });
        }

        // Check for "Invalid Section ID" error
        else if (err.message.includes('Section ID must be an integer')) {
            return res.status(400).json({ err: err.message });
        }

        // Check for "Error checking section existence" error
        else if (err.message.includes('Error checking section existence')) {
            return res.status(500).json({ err: err.message });
        }

        // Check for "Section code must be 7 characters" error
        else if (err.message.includes('Section code must be 7 characters')) {
            return res.status(400).json({ err: err.message });
        }

        // Check for "Section is not active" error
        else if (err.message.includes('is not active')) {
            return res.status(400).json({ err: err.message });
        }

        // Check for "Section has rostered students" error
        else if (err.message.includes('cannot change isActive status')) {
            return res.status(400).json({ err: err.message });
        }

        // Handle Sequelize database errors
        else if (err instanceof Sequelize.DatabaseError) {
            return res.status(500).json({ err: 'Database error occurred' });
        }

        else if (err instanceof UserDetailUpdateError) {
            return res.status(400).json({ err: err.message, userType: err.userType });
        }

        // Handle other errors
        else {
            console.error(err);  // Log the error for server-side reference
            return res.status(500).json({ err: 'Internal Server Error' });
        }
    }
};

module.exports = errorHandler;
