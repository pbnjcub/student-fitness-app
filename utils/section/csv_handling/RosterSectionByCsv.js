const { User, Section, SectionRoster, StudentDetail } = require('../../../models');
const { isValidEmail } = require('./validators');
const { getGradeLevel } = require('../helper_functions/SectionHelpers');

async function rosterToSectionRowHandler(rowData, rowNumber, sectionId) {
    const errors = [];
    const email = rowData.email?.trim();
    const sectionCode = rowData.sectionCode?.trim();

    if (!email) {
        errors.push({ row: rowNumber, field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(email)) {
        errors.push({ row: rowNumber, field: 'email', message: 'Invalid email format' });
    }

    if (!sectionCode) {
        errors.push({ row: rowNumber, field: 'sectionCode', message: 'Section code is required' });
    }

    if (errors.length > 0) {
        return { error: errors };
    }

    const section = await Section.findOne({ where: { id: sectionId } });
    if (!section) {
        errors.push({ row: rowNumber, field: 'section', message: 'Section not found' });
        return { error: errors };
    }

    const student = await User.findOne({
        where: { email },
        include: [{ model: StudentDetail, as: 'studentDetails' }],
    });

    if (!student) {
        errors.push({ row: rowNumber, field: 'student', message: 'Student not found' });
        return { error: errors };
    }

    if (student.userType !== 'student') {
        errors.push({ row: rowNumber, field: 'student', message: 'User is not a student' });
        return { error: errors };
    }

    const studentGradeLevel = getGradeLevel(student);
    if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
        errors.push({ row: rowNumber, field: 'gradeLevel', message: 'Grade level mismatch' });
        return { error: errors };
    }

    const existingRoster = await SectionRoster.findOne({
        where: { studentUserId: student.id, sectionId: section.id },
    });

    if (existingRoster) {
        errors.push({ row: rowNumber, field: 'roster', message: 'Student already rostered in this section' });
        return { error: errors };
    }

    return { data: { studentUserId: student.id, sectionId: section.id } };
}

module.exports = rosterToSectionRowHandler;
