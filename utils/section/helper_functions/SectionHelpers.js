const { sequelize, Section, SectionRoster, User, StudentDetail } = require('../../../models');

const gradeLevelEnumMapping = {
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    '10-11-12': '10-11-12'
};

function convertGradeLevelToEnum(gradeLevel) {
    // Convert numeric gradeLevel to string if it's not already a string
    const gradeLevelStr = gradeLevel.toString();

    // Use the mapping to find the corresponding enum label
    const enumLabel = gradeLevelEnumMapping[gradeLevelStr];

    if (!enumLabel) {
        throw new Error(`Invalid grade level: ${gradeLevel}`);
    }

    return enumLabel;
}

// const checkRequired = (sectionData) => {
//     const { sectionCode, gradeLevel } = sectionData;

//     const missingFields = [];

//     if (!sectionCode) missingFields.push('Section Code');
//     if (!gradeLevel) missingFields.push('Grade Level');

//     return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
// }

// Helper function to create a section
async function createSection(sectionData, transaction) {
    try {
        const {
            sectionCode,
            gradeLevel,
            isActive } = sectionData;
        
        const gradeLevelEnum = convertGradeLevelToEnum(gradeLevel);
        
        const [section, created] = await Section.findOrCreate({
            where: { sectionCode: sectionCode },
            defaults: {
                sectionCode,
                gradeLevel: gradeLevelEnum,
                isActive
            },
            transaction: transaction
        });

        if (!created) {
            throw new Error(`Section with section code ${sectionCode} already exists.`);
        }

        return section;
    } catch (err) {
        console.error('Error in createSection:', err);
        throw err;
    }
}

//find section by id
async function findSectionRoster(sectionId) {
    const sectionRoster = await SectionRoster.findAll({
        where: { sectionId },
        include: [{
            model: User,
            as: 'student',
            include: [{
                model: StudentDetail,
                as: 'studentDetails'
            }]
        }]
    });

    return sectionRoster.length ? sectionRoster.map(roster => roster.get({ plain: true })) : [];
}

//find current academic year
function getAcademicYear() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    if (currentMonth >= 8) {
        return currentYear + 1;
    } else {
        return currentYear;
    }
}

//find current grade level of student user
function getGradeLevel(studentUser) {
    const studentGradYear = studentUser.studentDetails.gradYear;

    if (typeof studentGradYear !== 'number' || studentGradYear < new Date().getFullYear()) {
        // Handle invalid or past graduation year
        return 'Invalid or past graduation year';
    }

    const currentAcademicYear = getAcademicYear();
    const yearsRemaining = studentGradYear - currentAcademicYear;

    if (yearsRemaining < 0) {
        // Student has already graduated
        return 'Graduated';
    } else if (yearsRemaining > 12) {
        // Student is younger than 1st grade
        return 'Pre-Grade 1';
    }

    const currentGradeLevel = 12 - yearsRemaining;
    return currentGradeLevel <= 0 ? 'Kindergarten or younger' : currentGradeLevel;
}

//helper function to check for enrolled students
async function hasEnrolledStudents(sectionId) {
    const enrolledStudents = await SectionRoster.count({ where: { sectionId } });
    return enrolledStudents > 0;
}

const handleTransaction = async (operation) => {
    const transaction = await sequelize.transaction();
    try {
        await operation(transaction);
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const createRosterEntries = async (students, sectionId, transaction) => {
    const rosteredStudents = [];
    for (const student of students) {
        const sectionRoster = await SectionRoster.create({
            studentUserId: student.id,
            sectionId: sectionId,
        }, { transaction });
        rosteredStudents.push(sectionRoster);
    }
    return rosteredStudents;
};



module.exports = {
    
    createSection,
    findSectionRoster,
    getAcademicYear,
    getGradeLevel,
    hasEnrolledStudents,
    handleTransaction,
    createRosterEntries
};