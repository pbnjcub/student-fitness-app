const { User, StudentDetail } = require('../../models'); // Import necessary models


async function checkCsvUsersExistEmail(csvData) {
    const errors = [];
    const existingUsers = {}; // Generalized to store IDs for any type of user

    for (const row of csvData) {
        const { email } = row;

        const userRecord = await User.findOne({
            where: { email },
            attributes: ['id', 'userType', 'isArchived'] // Fetch the id and userType for validation
        });

        if (!userRecord) {
            errors.push(`User with email ${email} not found`);
        } else {
            // If the user exists and is valid, store the ID for later use
            existingUsers[email] = { id: userRecord.id, userType: userRecord.userType, isArchived: userRecord.isArchived };
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }

    return existingUsers; // Return an object with emails as keys and user IDs as values
}

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

const checkCsvForDuplicateEmails = async (csvData) => {
    console.log('Checking for duplicate emails:', JSON.stringify(csvData, null, 2));
    const emails = new Set();
    const duplicates = new Set(); // Use a Set to ensure uniqueness

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
    checkCsvForDuplicateSectionCode,
    checkCsvForDuplicateEmails
 }