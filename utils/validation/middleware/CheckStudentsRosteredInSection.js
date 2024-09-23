const { formatError } = require('../../error_handling/ErrorHandler');
const { SectionRoster } = require('../../../models');

const checkStudentsRosteredInSection = async (req, res, next) => {
    const sectionId = req.params.sectionId; // Get sectionId from URL params
    const studentIds = req.existingStudents.map(student => student.id); // Collect student IDs from req.existingStudents
    const errors = [];

    try {
        // Check if each student is rostered in the specific section
        for (const studentId of studentIds) {
            const sectionRoster = await SectionRoster.findOne({
                where: {
                    studentUserId: studentId,
                    sectionId: sectionId // Ensure this sectionId matches the current section in the URL
                }
            });

            if (!sectionRoster) {
                // If the student is not rostered in this section, add an error
                errors.push(formatError('studentUserId', `Student with ID ${studentId} is not rostered in section ${sectionId}`));
            }
        }

        // If there are errors, pass them to the next middleware or error handler
        if (errors.length > 0) {
            return next(errors);
        }

        // Proceed to the next middleware if no errors
        next();
    } catch (err) {
        console.error('Error checking if students are rostered in the section:', err);
        next(err); // Pass the error to the centralized error handler
    }
};

module.exports = checkStudentsRosteredInSection;
