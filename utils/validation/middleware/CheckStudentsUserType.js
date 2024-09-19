const { formatError } = require('../../error_handling/ErrorHandler');

const checkStudentsUserType = (req, res, next) => {
    // Filter the existing students to find any that are not of type 'student'
    const invalidUsers = req.existingStudents.filter(student => student.userType !== 'student');
    const errors = [];

    invalidUsers.forEach(user => {
        errors.push(formatError('userType', `User with ID ${user.id} is not a student`));
        }
    );

    if (errors.length > 0) {
        // If there are errors, pass the array of errors to the error handler
        return next(errors);
    }

    next();
};

module.exports = checkStudentsUserType;
