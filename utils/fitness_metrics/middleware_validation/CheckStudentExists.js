const { User } = require('../../../models');

async function checkStudentExists(req, res, next) {
    const { id } = req.params;

    if (isNaN(id)) {
        const err = new Error('Student ID must be an integer');
        err.status = 400;
        return next(err);
    }

    try {
        const student = await User.findByPk(id);
        if (!student) {
            const err = new Error(`Student with ID ${id} not found`);
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

module.exports = { checkStudentExists };