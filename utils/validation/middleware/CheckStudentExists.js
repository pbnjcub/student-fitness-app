const { User } = require('../../../models');

async function checkStudentExists(req, res, next) {
    const { id } = req.params;

    try {
        const student = await User.findByPk(id);
        if (!student || student.userType !== 'student') {
            const err = new Error(`Student with ID ${id} not found or is not a student`);
            err.status = 404;
            return next(err);
        }
        req.student = student;
        next();
    } catch (err) {
        console.error('Error checking student existence:', err);
        next(err);
    }
}

module.exports = checkStudentExists;