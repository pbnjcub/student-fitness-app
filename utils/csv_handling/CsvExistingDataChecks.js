const { User, StudentDetail, Section, SectionRoster } = require('../../models'); // Import necessary models
const { formatError } = require('../error_handling/ErrorHandler');

async function checkCsvUsersExistEmail(csvData) {
    const existingUsers = {}; // Generalized to store IDs for any type of user

    try {
        for (const row of csvData) {
            const { email } = row;

            // Perform the database query
            const userRecord = await User.findOne({
                where: { email },
                attributes: ['id', 'userType', 'isArchived'] // Fetch the id, userType, and isArchived for validation
            });

            if (userRecord) {
                existingUsers[email] = { id: userRecord.id, userType: userRecord.userType, isArchived: userRecord.isArchived };
            } else {
                // If the user exists and is valid, store the ID for later use
                existingUsers[email] = null;
            }
        }

        return existingUsers; // Return an object with emails as keys and user info (id, userType, isArchived) as values
    } catch (err) {
        console.error('Error checking user existence by email:', err);
        throw err; // Propagate the error up to be caught by the route handler
    }
}

// async function checkCsvUsersExistEmail(csvData) {
//     const errors = [];
//     const existingUsers = {}; // Generalized to store IDs for any type of user

//     try {
//         for (const row of csvData) {
//             const { email } = row;

//             // Perform the database query
//             const userRecord = await User.findOne({
//                 where: { email },
//                 attributes: ['id', 'userType', 'isArchived'] // Fetch the id, userType, and isArchived for validation
//             });

//             if (!userRecord) {
//                 // Use formatError to push a formatted error into the array
//                 errors.push(formatError('email', `User with email ${email} not found`));
//             } else {
//                 // If the user exists and is valid, store the ID for later use
//                 existingUsers[email] = { id: userRecord.id, userType: userRecord.userType, isArchived: userRecord.isArchived };
//             }
//         }

//         if (errors.length > 0) {
//             // Use the formatted errors in the error message
//             throw new Error(errors.map(err => err.message).join('; '));
//         }

//         return existingUsers; // Return an object with emails as keys and user info (id, userType, isArchived) as values
//     } catch (err) {
//         console.error('Error checking user existence by email:', err);
//         throw err; // Propagate the error up to be caught by the route handler
//     }
// }

const checkCsvUsersAreStudents = (users) => {
    const errors = [];

    for (const email in users) {
        const { userType } = users[email];
        
        if (userType !== 'student') {
            errors.push(`User with email ${email} is not a student.`);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }
};

const checkCsvUsersArchived = (users) => {
    const errors = [];

    for (const email in users) {
        const { isArchived } = users[email];
        
        if (isArchived) {
            errors.push(`User with email ${email} is archived.`);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }
};

// Check if students are already rostered in any section
const checkCsvStudentsRostered = async (users) => {
    const errors = [];

    try {
        for (const email in users) {
            const { id } = users[email];

            // Check if the student is already rostered in any section
            const sectionRoster = await SectionRoster.findOne({
                where: { studentUserId: id }
            });

            if (sectionRoster) {
                errors.push(`Student with email ${email} is already rostered in a section.`);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

    } catch (err) {
        console.error('Error checking if students are rostered:', err);
        throw err;

    }

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

async function checkCsvSectionsExistsBySectionCode(csvData) {
    console.log('Checking if section codes exist');

    const errors = [];

    try {
        for (const row of csvData) {
            const { sectionCode } = row;

            const existingSection = await Section.findOne({
                where: { sectionCode }
            });

            if (existingSection) {
                errors.push(formatError('sectionCode', `Section with section code ${sectionCode} already exists`));
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.map(err => err.message).join('; '));
        }

    } catch (err) {
        console.error('Error checking section code existence:', err);
        throw err;
    }
}

const checkCsvForDuplicateEmails = async (csvData) => {
    console.log('Checking for duplicate emails:', JSON.stringify(csvData, null, 2));
    const emails = new Set();
    const duplicates = new Set(); 

    for (const data of csvData) {
        if (!data.email) {
            continue; // Skip if email is missing or falsy
        }
        
        if (emails.has(data.email)) {
            duplicates.add(data.email); // Add to duplicates if email already exists
        } else {
            emails.add(data.email); // Otherwise, add email to Set
        }
    }

    console.log('Duplicate emails:', [...duplicates]);
    if (duplicates.size > 0) {
        throw new Error(`Duplicate emails found: ${[...duplicates].join(', ')}`);
    }
};



module.exports = {
    checkCsvUsersExistEmail,
    checkCsvUsersAreStudents,
    checkCsvUsersArchived,
    checkCsvStudentsRostered,
    checkCsvForDuplicateSectionCode,
    checkCsvSectionsExistsBySectionCode,
    checkCsvForDuplicateEmails
 }