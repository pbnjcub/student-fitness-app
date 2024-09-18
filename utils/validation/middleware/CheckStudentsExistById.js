
const { User } = require('../../../models'); // Adjust the import path as needed

const checkStudentsExistById = async (req, res, next) => {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: 'studentIds must be a non-empty array.' });
    }

    const errors = [];
    const existingStudents = [];

    try {
        for (const id of studentIds) {
            const studentRecord = await User.findOne({
                where: { id },
                attributes: ['id', 'userType', 'isArchived'] // Fetch the id, userType, and isArchived
            });

            if (!studentRecord) {
                errors.push(`Student with ID ${id} not found`);
            } else {
                // Store the whole record with id, userType, and isArchived
                existingStudents.push(studentRecord);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Attach existingStudents (with id, userType, isArchived) to the request object for use in later middleware
        req.existingStudents = existingStudents;
        next();
    } catch (err) {
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkStudentsExistById;


