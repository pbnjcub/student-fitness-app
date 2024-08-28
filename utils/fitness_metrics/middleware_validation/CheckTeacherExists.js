const { User } = require('../../../models');

function checkTeacherExists({ required = false } = {}) {
    return async function (req, res, next) {
        const { teacherUserId } = req.body;

        if (required && teacherUserId == null) {
            const err = new Error('Teacher ID is required for this operation');
            err.status = 400;
            return next(err);
        }

        if (!teacherUserId) {
            return next();
        }

        try {
            const teacher = await User.findByPk(teacherUserId);
            console.log()
            if (!teacher || teacher.userType !== 'teacher') {
                const err = new Error(`Teacher with ID ${teacherUserId} not found or is not a teacher`);
                err.status = 404;
                return next(err);
            }
            req.teacher = teacher;
        } catch (err) {
            console.error('Error checking teacher existence:', err);
            return next(err);
        }
    }
};


module.exports = checkTeacherExists;