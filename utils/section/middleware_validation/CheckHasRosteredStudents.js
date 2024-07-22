const { SectionRoster } = require('../../../models');

async function hasRosteredStudents(req, res, next) {
    const { id } = req.params;

    try {
        const rosteredStudentsCount = await SectionRoster.count({ where: { sectionId: id } });
        if (rosteredStudentsCount > 0) {
            return res.status(400).json({
                errs: [
                    {
                        field: 'isActive',
                        message: 'Section has rostered students and cannot change isActive status.'
                    }
                ]
            });
        }
        req.hasRosteredStudents = rosteredStudentsCount > 0;
        next();
    } catch (err) {
        console.error('Error checking rostered students:', err);
        next(err);  // Pass the error to the centralized error handler
    }
}

module.exports = { hasRosteredStudents };
