const { SectionRoster } = require('../../../models');

async function checkStudentsAlreadyRosteredInToSection(req, res, next) {
    const { activeStudentIds } = req;  // Using the list from req, which should be populated by previous middleware
    const { toSectionId } = req.body;
    const alreadyInTargetSectionIds = [];

    for (const studentUserId of activeStudentIds) {  // Ensure you are using the right variable here
        const existingInTargetSection = await SectionRoster.findOne({
            where: {
                studentUserId,
                sectionId: toSectionId
            }
        });

        if (existingInTargetSection) {
            alreadyInTargetSectionIds.push(studentUserId);
        }
    }

    if (alreadyInTargetSectionIds.length > 0) {
        req.alreadyInTargetSectionIds = alreadyInTargetSectionIds;  // Storing IDs for potential later use
        return res.status(400).json({
            error: 'Some students are already rostered in the target section',
            studentIds: alreadyInTargetSectionIds
        });
    }

    next();
}

module.exports = checkStudentsAlreadyRosteredInToSection;


