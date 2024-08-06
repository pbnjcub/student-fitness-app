const { SectionRoster } = require('../../../models');

const checkStudentsInFromSection = async (req, res, next) => {
    const { activeStudentIds } = req;
    const { fromSectionId } = req.body;

    try {
        const notInSectionStudents = [];
        const validSectionStudents = [];

        for (const id of activeStudentIds) {
            const rosterRecord = await SectionRoster.findOne({
                where: { studentUserId: id, sectionId: fromSectionId }
            });

            if (!rosterRecord) {
                notInSectionStudents.push(id);
            } else {
                validSectionStudents.push(id);
            }
        }

        if (notInSectionStudents.length > 0) {
            return res.status(400).json({ 
                error: 'Some students are not in the fromSection', 
                studentIds: notInSectionStudents 
            });
        }

        req.validSectionStudents = validSectionStudents;
        next();
    } catch (err) {
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkStudentsInFromSection;
