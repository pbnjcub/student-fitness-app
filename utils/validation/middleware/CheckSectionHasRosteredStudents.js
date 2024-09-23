const { SectionRoster, Section } = require('../../../models');

async function checkSectionHasRosteredStudents(req, res, next) {
    const { id } = req.params;

    try {
        // Find the section by its ID
        const section = await Section.findByPk(id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Attach the section to the request object for later use
        req.section = section;

        // Count the number of rostered students in the section
        const rosteredStudentsCount = await SectionRoster.count({ where: { sectionId: id } });
        
        // Attach the result to the request object
        req.hasRosteredStudents = rosteredStudentsCount > 0;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error('Error checking rostered students:', err);
        next(err);  // Pass the error to the centralized error handler
    }
}

module.exports = checkSectionHasRosteredStudents;