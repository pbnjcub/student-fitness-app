const { SectionRoster, Section } = require('../../../models');

async function hasRosteredStudents(req, res, next) {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const section = await Section.findByPk(id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        req.section = section; // Attach the section to the request object for further use

        const rosteredStudentsCount = await SectionRoster.count({ where: { sectionId: id } });
        req.hasRosteredStudents = rosteredStudentsCount > 0;

        if (section.isActive && typeof isActive === 'boolean' && section.isActive !== isActive) {
            if (req.hasRosteredStudents) {
                return res.status(400).json({
                    errs: [
                        {
                            field: 'isActive',
                            message: 'Section has rostered students and cannot change isActive status.'
                        }
                    ]
                });
            }
        }

        next(); // Proceed to the next middleware if all checks pass
    } catch (err) {
        console.error('Error checking rostered students:', err);
        next(err);  // Pass the error to the centralized error handler
    }
}

module.exports = { hasRosteredStudents };



// const { SectionRoster } = require('../../../models');

// async function hasRosteredStudents(req, res, next) {
//     const { id } = req.params;

//     try {
//         const rosteredStudentsCount = await SectionRoster.count({ where: { sectionId: id } });
//         if (rosteredStudentsCount > 0) {
//             return res.status(400).json({
//                 errs: [
//                     {
//                         field: 'isActive',
//                         message: 'Section has rostered students and cannot change isActive status.'
//                     }
//                 ]
//             });
//         }
//         req.hasRosteredStudents = rosteredStudentsCount > 0;
//         next();
//     } catch (err) {
//         console.error('Error checking rostered students:', err);
//         next(err);  // Pass the error to the centralized error handler
//     }
// }

// module.exports = { hasRosteredStudents };
