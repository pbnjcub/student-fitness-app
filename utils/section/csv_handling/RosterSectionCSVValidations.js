const { User, StudentDetail } = require('../../../models'); // Import necessary models

async function checkStudentsExistEmail(newStudents) {
    const errors = [];
    const studentIds = {};

    for (const student of newStudents) {
        const { email } = student;

        const studentRecord = await User.findOne({
            where: { email },
            include: [{ model: StudentDetail, as: 'studentDetails' }],
            attributes: ['id', 'userType'] // Fetch the id and userType for validation
        });

        if (!studentRecord) {
            errors.push(`Student with email ${email} not found`);
        } else if (studentRecord.userType !== 'student') {
            errors.push(`User with email ${email} is not a student`);
        } else {
            // If the student exists and is valid, store the ID for later use
            studentIds[email] = studentRecord.id;
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }

    return studentIds; // Return an object with emails as keys and student IDs as values
}

module.exports = checkStudentsExistEmail; // Export the function