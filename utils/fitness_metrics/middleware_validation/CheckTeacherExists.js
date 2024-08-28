const { User } = require('../../../models');

function checkTeacherExists({ required = false } = {}) {
    return async function (req, res, next) {
        const { teacherUserId } = req.body;
        console.log("Entered checkTeacherExists: TeacherUserId =", teacherUserId, "Required =", required);

        if (required && teacherUserId == null) {
            console.log("Error: Teacher ID is required but not provided.");
            const err = new Error('Teacher ID is required for this operation');
            err.status = 400;
            return next(err);
        }

        if (!teacherUserId) {
            console.log("No teacherUserId provided and it is not required. Moving to next middleware.");
            return next();
        }

        try {
            console.log("Attempting to find teacher with ID:", teacherUserId);
            const teacher = await User.findByPk(teacherUserId);
            if (!teacher) {
                console.log(`No teacher found with ID: ${teacherUserId}`);
                const err = new Error(`Teacher with ID ${teacherUserId} not found`);
                err.status = 404;
                return next(err);
            }
            if (teacher.userType !== 'teacher') {
                console.log(`User with ID: ${teacherUserId} is not a teacher, userType: ${teacher.userType}`);
                const err = new Error(`Teacher with ID ${teacherUserId} not found or is not a teacher`);
                err.status = 404;
                return next(err);
            }
            console.log("Teacher found and valid: ", teacherUserId);
            req.teacher = teacher;
            next();
        } catch (err) {
            console.error('Error checking teacher existence:', err);
            return next(err);
        }
    }
};



module.exports = checkTeacherExists;