const { User } = require('../../../models'); // Adjust the import path as needed

const checkMultipleStudentsExist = async (req, res, next) => {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: 'studentIds must be a non-empty array.' });
    }

    const errors = [];
    const validStudentIds = [];

    try {
        for (const id of studentIds) {
            const studentRecord = await User.findOne({
                where: { id },
                attributes: ['id', 'userType'] // Fetch the id and userType for validation
            });

            if (!studentRecord) {
                errors.push(`Student with ID ${id} not found`);
            } else if (studentRecord.userType !== 'student') {
                errors.push(`User with ID ${id} is not a student`);
            } else {
                // If the student exists and is valid, add the ID to the validStudentIds array
                validStudentIds.push(studentRecord.id);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Attach validStudentIds to the request object for later use
        req.validStudentIds = validStudentIds;
        next();
    } catch (err) {
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkMultipleStudentsExist;
