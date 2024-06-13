// utils/validation/SectionValidation.js

const { User, Section, SectionRoster, StudentDetail } = require('../../models');
const { getGradeLevel } = require('../section/SectionHelpers');

// Validation for rostering students
async function validateRoster(req, res, next) {
    const { sectionId } = req.params;
    let { studentUserIds } = req.body;

    if (!sectionId) {
        console.log('Section ID is required');
        return res.status(400).json({ error: 'Section ID is required' });
    }

    if (!Array.isArray(studentUserIds)) {
        studentUserIds = [studentUserIds];
    }

    if (studentUserIds.length === 0) {
        console.log('At least one Student User ID is required');
        return res.status(400).json({ error: 'At least one Student User ID is required' });
    }

    req.validationErrors = {
        duplicateIds: [],
        userDoesNotExist: [],
        userNotAStudent: [],
        alreadyRosteredStudents: [],
        incorrectGradeLevel: [],
    };

    req.validatedStudents = [];
    const processedIds = new Set();

    try {
        const section = await Section.findByPk(sectionId);
        if (!section) {
            console.log(`Section with ID ${sectionId} not found`);
            return res.status(404).json({ error: 'Section not found' });
        }

        for (const studentUserId of studentUserIds) {
            if (processedIds.has(studentUserId)) {
                req.validationErrors.duplicateIds.push(studentUserId);
                continue;
            }

            processedIds.add(studentUserId);

            const student = await User.findByPk(studentUserId, {
                include: [{ model: StudentDetail, as: 'studentDetails' }],
            });

            if (!student) {
                req.validationErrors.userDoesNotExist.push(studentUserId);
                continue;
            }

            if (student.userType !== 'student') {
                req.validationErrors.userNotAStudent.push(studentUserId);
                continue;
            }

            const studentGradeLevel = getGradeLevel(student);
            if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
                req.validationErrors.incorrectGradeLevel.push(studentUserId);
                continue;
            }

            const existingRoster = await SectionRoster.findOne({
                where: { studentUserId: studentUserId, sectionId: sectionId },
            });

            if (existingRoster) {
                req.validationErrors.alreadyRosteredStudents.push(studentUserId);
                continue;
            }

            req.validatedStudents.push(student);
        }

        if (
            req.validationErrors.duplicateIds.length > 0 ||
            req.validationErrors.userDoesNotExist.length > 0 ||
            req.validationErrors.userNotAStudent.length > 0 ||
            req.validationErrors.alreadyRosteredStudents.length > 0 ||
            req.validationErrors.incorrectGradeLevel.length > 0
        ) {
            console.log('Validation errors:', req.validationErrors);
            return res.status(400).json({
                error: 'Some students could not be rostered',
                ...req.validationErrors,
            });
        }

        next();
    } catch (error) {
        console.error('Error validating roster:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Validation for unrostering students
async function validateUnroster(req, res, next) {
    const { sectionId } = req.params;
    let { studentUserIds } = req.body;

    if (!sectionId) {
        console.log('Section ID is required');
        return res.status(400).json({ error: 'Section ID is required' });
    }

    if (!Array.isArray(studentUserIds)) {
        studentUserIds = [studentUserIds];
    }

    if (studentUserIds.length === 0) {
        console.log('At least one Student User ID is required');
        return res.status(400).json({ error: 'At least one Student User ID is required' });
    }

    req.validationErrors = {
        duplicateIds: [],
        userDoesNotExist: [],
        userNotAStudent: [],
        notRosteredStudents: [],
        incorrectGradeLevel: [],
    };

    req.validatedStudents = [];
    const processedIds = new Set();

    try {
        const section = await Section.findByPk(sectionId);
        if (!section) {
            console.log(`Section with ID ${sectionId} not found`);
            return res.status(404).json({ error: 'Section not found' });
        }

        for (const studentUserId of studentUserIds) {
            if (processedIds.has(studentUserId)) {
                req.validationErrors.duplicateIds.push(studentUserId);
                continue;
            }

            processedIds.add(studentUserId);

            const student = await User.findByPk(studentUserId, {
                include: [{ model: StudentDetail, as: 'studentDetails' }],
            });

            if (!student) {
                req.validationErrors.userDoesNotExist.push(studentUserId);
                continue;
            }

            if (student.userType !== 'student') {
                req.validationErrors.userNotAStudent.push(studentUserId);
                continue;
            }

            const studentGradeLevel = getGradeLevel(student);
            if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
                req.validationErrors.incorrectGradeLevel.push(studentUserId);
                continue;
            }

            const existingRoster = await SectionRoster.findOne({
                where: { studentUserId: studentUserId, sectionId: sectionId },
            });

            if (!existingRoster) {
                req.validationErrors.notRosteredStudents.push(studentUserId);
                continue;
            }

            req.validatedStudents.push(student);
        }

        if (
            req.validationErrors.duplicateIds.length > 0 ||
            req.validationErrors.userDoesNotExist.length > 0 ||
            req.validationErrors.userNotAStudent.length > 0 ||
            req.validationErrors.notRosteredStudents.length > 0 ||
            req.validationErrors.incorrectGradeLevel.length > 0
        ) {
            console.log('Validation errors:', req.validationErrors);
            return res.status(400).json({
                error: 'Some students could not be unrostered',
                ...req.validationErrors,
            });
        }

        next();
    } catch (error) {
        console.error('Error validating unroster:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { validateRoster, validateUnroster };
