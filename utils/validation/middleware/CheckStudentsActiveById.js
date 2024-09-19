const { formatError } = require('../../error_handling/ErrorHandler');

const checkStudentsActiveById = (req, res, next) => {
    const { existingStudents } = req;
    const errors = [];

    // Use the existing student data from req.existingStudents
    existingStudents.forEach(student => {
        if (student.isArchived) {
            errors.push(formatError('studentId', `Student with ID ${student.id} is archived`));
        }
    });

    if (errors.length > 0) {
        // If there are errors, pass the array of errors to the error handler
        return next(errors);
    }

    // If no students are archived, proceed to the next middleware
    next();
};

module.exports = checkStudentsActiveById;
