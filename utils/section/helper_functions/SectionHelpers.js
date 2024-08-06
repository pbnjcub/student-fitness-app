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

// const handleTransaction = async (operation) => {
//     const transaction = await sequelize.transaction();
//     try {
//         await operation(transaction);
//         await transaction.commit();
//     } catch (err) {
//         await transaction.rollback();
//         throw err;
//     }
// };

const createRosterEntries = async (students, sectionId, transaction) => {
    const rosteredStudents = [];
    const alreadyRosteredEmails = [];

    for (const student of students) {
        const { id: studentUserId, email } = student;

        // Check if the student is already rostered in any section
        const existingRoster = await SectionRoster.findOne({
            where: {
                studentUserId
            }
        });

        if (existingRoster) {
            alreadyRosteredEmails.push(email);
            continue; // Skip this student and continue with the next one
        }

        // Create SectionRoster entry
        const sectionRoster = await SectionRoster.create({
            studentUserId,
            sectionId: sectionId,
        }, { transaction });

        rosteredStudents.push(sectionRoster);
    }

    if (alreadyRosteredEmails.length > 0) {
        throw new Error(`The following students are already rostered in other sections: ${alreadyRosteredEmails.join(', ')}`);
    }

    return rosteredStudents;
};





//check for duplicate section codes in CSV upload
const checkCsvForDuplicateSectionCode = async (newSections) => {
    console.log('Checking for duplicate section codes:', JSON.stringify(newSections, null, 2));
    const sectionCodes = new Set();
    const duplicates = [];

    for (const section of newSections) {
        if (sectionCodes.has(section.sectionCode)) {
            duplicates.push(section.sectionCode);
        }
        sectionCodes.add(section.sectionCode);
    }

    console.log('Duplicate section codes:', duplicates);
    if (duplicates.length > 0) {
        throw new Error(`Duplicate section codes found: ${[...new Set(duplicates)].join(', ')}`);
    }
};

const checkCsvForDuplicateEmails = async (newStudents) => {
    console.log('Checking for duplicate emails:', JSON.stringify(newStudents, null, 2));
    const emails = new Set();
    const duplicates = [];

    for (const student of newStudents) {
        if (emails.has(student.email)) {
            duplicates.push(student.email);
        }
        emails.add(student.email);
    }

    console.log('Duplicate emails:', duplicates);
    if (duplicates.length > 0) {
        throw new Error(`Duplicate emails found: ${[...new Set(duplicates)].join(', ')}`);
    }
};


const switchRosterEntries = async (studentIds, fromSectionId, toSectionId, transaction) => {
    const switchedStudents = [];
    const alreadyInTargetSectionIds = [];
    const notInSourceSectionIds = [];

    for (const studentUserId of studentIds) {
        // Check if the student is rostered in the target section already
        const existingInTargetSection = await SectionRoster.findOne({
            where: {
                studentUserId,
                sectionId: toSectionId,
            },
            transaction,
        });

        if (existingInTargetSection) {
            alreadyInTargetSectionIds.push(studentUserId);
            continue; // Skip this student if already in the target section
        }

        // Check if the student is rostered in the current (from) section
        const existingInFromSection = await SectionRoster.findOne({
            where: {
                studentUserId,
                sectionId: fromSectionId,
            },
            transaction,
        });

        if (!existingInFromSection) {
            notInSourceSectionIds.push(studentUserId);
            continue;
        }

        // Remove from the current section
        await existingInFromSection.destroy({ transaction });

        // Add to the target section
        const newRosterEntry = await SectionRoster.create({
            studentUserId,
            sectionId: toSectionId,
        }, { transaction });

        switchedStudents.push(newRosterEntry);
    }

    if (alreadyInTargetSectionIds.length > 0) {
        console.log(`The following students are already rostered in the target section: ${alreadyInTargetSectionIds.join(', ')}`);
    }

    if (notInSourceSectionIds.length > 0) {
        console.log(`The following students were not found in the source section: ${notInSourceSectionIds.join(', ')}`);
    }

    return switchedStudents;
};



module.exports = {
    
    createSection,
    findSectionRoster,
    getAcademicYear,
    getGradeLevel,
    hasEnrolledStudents,
    createRosterEntries,
    checkCsvForDuplicateSectionCode,
    checkCsvForDuplicateEmails,
    switchRosterEntries
};