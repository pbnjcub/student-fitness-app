const { User, Section, SectionRoster, StudentDetail } = require('../../../models');
const { isValidEmail } = require('./validators');
const { getGradeLevel } = require('../helper_functions/SectionHelpers');

async function rosterToSectionRowHandler(rowData, rowNumber, sectionId) {
    const err = [];
    const email = rowData.email?.trim();
    const sectionCode = rowData.sectionCode?.trim();

    if (!email) {
        err.push({ row: rowNumber, field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(email)) {
        err.push({ row: rowNumber, field: 'email', message: 'Invalid email format' });
    }

    if (!sectionCode) {
        err.push({ row: rowNumber, field: 'sectionCode', message: 'Section code is required' });
    }

    if (err.length > 0) {
        return { errs: err };
    }

    const section = await Section.findOne({ where: { id: sectionId } });
    if (!section) {
        err.push({ row: rowNumber, field: 'section', message: 'Section not found' });
        return { errs: err };
    }

    const student = await User.findOne({
        where: { email },
        include: [{ model: StudentDetail, as: 'studentDetails' }],
    });

    if (!student) {
        err.push({ row: rowNumber, field: 'student', message: 'Student not found' });
        return { errs: err };
    }

    if (student.userType !== 'student') {
        err.push({ row: rowNumber, field: 'student', message: 'User is not a student' });
        return { errs: err };
    }

    const studentGradeLevel = getGradeLevel(student);
    if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
        err.push({ row: rowNumber, field: 'gradeLevel', message: 'Grade level mismatch' });
        return { errs: err };
    }

    const existingRoster = await SectionRoster.findOne({
        where: { studentUserId: student.id, sectionId: section.id },
    });

    if (existingRoster) {
        err.push({ row: rowNumber, field: 'roster', message: 'Student already rostered in this section' });
        return { errs: err };
    }

    return { data: { studentUserId: student.id, sectionId: section.id } };
}

module.exports = rosterToSectionRowHandler;
