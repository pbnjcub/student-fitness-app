const { User } = require('../../../models');
const { formatError } = require('../../error_handling/ErrorHandler'); // Adjust the path as necessary

const checkStudentsExistById = async (req, res, next) => {
    const { studentUserIds } = req.body;

    if (!Array.isArray(studentUserIds) || studentUserIds.length === 0) {
        const err = new Error('studentUserIds must be a non-empty array.');
        err.status = 400;
        return next(err);
    }

    const errors = [];
    const existingStudents = [];

    try {
        for (const id of studentUserIds) {
            const studentRecord = await User.findOne({
                where: { id },
                attributes: ['id', 'userType', 'isArchived'] 
            });

            if (!studentRecord) {
                // Use formatError to format the error message
                errors.push(formatError('studentUserId', `Student with ID ${id} not found`));
            } else {
                existingStudents.push(studentRecord);
            }
        }

        if (errors.length > 0) {
            return next(errors); // Pass the array of errors to the error handler
        }

        req.existingStudents = existingStudents;
        next();
    } catch (err) {
        next(err); // General error catching
    }
};

module.exports = checkStudentsExistById;
