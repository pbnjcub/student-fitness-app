const { User } = require('../../../models');

const checkStudentsActiveById = async (req, res, next) => {
    const { validStudentIds } = req;

    try {
        const inactiveOrArchivedStudents = [];
        const activeStudentIds = [];

        for (const id of validStudentIds) {
            const studentRecord = await User.findByPk(id);

            if (studentRecord.isArchived) {
                inactiveOrArchivedStudents.push(id);
            } else {
                activeStudentIds.push(id);
            }
        }

        if (inactiveOrArchivedStudents.length > 0) {
            return res.status(400).json({ 
                error: 'Some students are inactive or archived', 
                studentIds: inactiveOrArchivedStudents 
            });
        }

        req.activeStudentIds = activeStudentIds;
        next();
    } catch (err) {
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkStudentsActiveById;
