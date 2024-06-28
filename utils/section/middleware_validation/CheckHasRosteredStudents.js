const { SectionRoster } = require('../../../models');

async function hasRosteredStudents(req, res, next) {
    const { id } = req.params;

    try {
        const rosteredStudentsCount = await SectionRoster.count({ where: { sectionId: id } });
        req.hasRosteredStudents = rosteredStudentsCount > 0;  // Attach the result to the request object
        next();
    } catch (err) {
        console.error('Error checking rostered students:', err);
        next(err);  // Pass the error to the error-handling middleware
    }
}

module.exports = { hasRosteredStudents };
