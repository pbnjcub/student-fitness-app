const Sequelize = require('sequelize');
const { UserDetailUpdateError } = require('./CustomErrors');

const errorHandler = (err, req, res, next) => {

    console.error(err);

    if (Array.isArray(err)) {
        return res.status(422).json({ errors: err });
    }

    if (err.message) {
        // Check for user already exists error
        if (err.message === "User already exists.") {
            return res.status(409).json({ error: err.message });
        }

        // Check for section already exists error
        else if (err.message === "Section already exists.") {
            return res.status(409).json({ error: err.message });
        }

        // Check for invalid user type error
        else if (err.message === "Invalid user type") {
            return res.status(400).json({ error: err.message });
        }

        // Check for invalid or missing graduation year
        else if (err.message.includes("Invalid or missing graduation year for student")) {
            return res.status(400).json({ error: err.message });
        }

        // Check for missing student details
        else if (err.message.includes("Missing student details")) {
            return res.status(400).json({ error: err.message });
        }

        // Handle Sequelize validation errors
        else if (err instanceof Sequelize.ValidationError) {
            return res.status(400).json({ errors: err.errors.map(e => ({ [e.path]: e.message })) });
        }

        // Check for "User Not Found" error
        else if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        // Check for "Section Not Found" error
        else if (err.message.includes('Section with ID')) {
            return res.status(404).json({ error: err.message });
        }

        // Handle Sequelize database errors
        else if (err instanceof Sequelize.DatabaseError) {
            return res.status(500).json({ error: 'Database error occurred' });
        }

        else if (err instanceof UserDetailUpdateError) {
            return res.status(400).json({ error: err.message, userType: err.userType });
        }

        // Handle other errors
        else {
            console.error(err);  // Log the error for server-side reference
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = errorHandler;
