const { Section, SectionRoster } = require('../../../models');
const { formatError } = require('../../error_handling/ErrorHandler');
const { Op } = require('sequelize');

const checkStudentsRostered = async (req, res, next) => {
    const studentIds = req.existingStudents.map(student => student.id);
    const errors = [];

    try {
        // Fetch rostered students and their section codes by joining the Section table
        const rosteredStudents = await SectionRoster.findAll({
            where: {
                studentUserId: {
                    [Op.in]: studentIds,
                },
            },
            include: [
                {
                    model: Section, // Assuming Section is associated with SectionRoster
                    attributes: ['sectionCode'], // Include sectionCode from Section model
                }
            ],
            attributes: ['studentUserId'], // Keep studentUserId in the result
        });

        // If any students are already rostered, collect errors
        rosteredStudents.forEach(student => {
            const sectionCode = student.Section.sectionCode; // Access the sectionCode from the related Section
            errors.push(formatError(
                'studentUserId', 
                `Student with ID ${student.studentUserId} is already rostered in section ${sectionCode}`
            ));
        });

        // If there are errors, pass them to the next middleware
        if (errors.length > 0) {
            return next(errors);
        }
        
        next(); // Proceed to the next middleware if no errors
    } catch (err) {
        next(err); // Handle any unexpected errors
    }
};

module.exports = checkStudentsRostered;
