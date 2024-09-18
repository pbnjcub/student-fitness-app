const checkStudentsUserType = (req, res, next) => {
    // Filter the existing students to find any that are not of type 'student'
    const invalidUsers = req.existingStudents.filter(student => student.userType !== 'student');

    if (invalidUsers.length > 0) {
        // If there are invalid users, return a 400 error with details
        const invalidUserIds = invalidUsers.map(user => user.id);
        return res.status(400).json({
            error: 'Some users are not students and cannot be rostered.',
            invalidUserIds,
        });
    }

    // If all users are of type 'student', proceed to the next middleware
    next();
};

module.exports = checkStudentsUserType;
