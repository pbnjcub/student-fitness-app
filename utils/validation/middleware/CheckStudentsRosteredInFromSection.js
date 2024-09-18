const { SectionRoster } = require('../../../models');

const checkStudentsRosteredInFromSection = async (req, res, next) => {
    const { activeStudentIds } = req;
    const { fromSectionId } = req.body;

    try {
        const notRosteredInFromSectionStudents = [];
        const rosteredInFromSectionStudents = [];

        for (const id of activeStudentIds) {
            const rosterRecord = await SectionRoster.findOne({
                where: { studentUserId: id, sectionId: fromSectionId }
            });

            if (!rosterRecord) {
                notRosteredInFromSectionStudents.push(id);
            } else {
                rosteredInFromSectionStudents.push(id);
            }
        }

        if (notRosteredInFromSectionStudents.length > 0) {
            return res.status(400).json({ 
                error: 'Some students are not in the fromSection', 
                studentIds: notRosteredInFromSectionStudents 
            });
        }

        req.rosteredInFromSectionStudents = rosteredInFromSectionStudents;
        next();
    } catch (err) {
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkStudentsRosteredInFromSection;
