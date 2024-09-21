const { User, StudentDetail, Section } = require('../../models'); // Import necessary models
const { formatError } = require('../error_handling/ErrorHandler');

async function checkCsvUsersExistEmail(csvData) {
    const errors = [];
    const existingUsers = {}; // Generalized to store IDs for any type of user

    try {
        for (const row of csvData) {
            const { email } = row;

            // Perform the database query
            const userRecord = await User.findOne({
                where: { email },
                attributes: ['id', 'userType', 'isArchived'] // Fetch the id, userType, and isArchived for validation
            });

            if (!userRecord) {
                // Use formatError to push a formatted error into the array
                errors.push(formatError('email', `User with email ${email} not found`));
            } else {
                // If the user exists and is valid, store the ID for later use
                existingUsers[email] = { id: userRecord.id, userType: userRecord.userType, isArchived: userRecord.isArchived };
            }
        }

        if (errors.length > 0) {
            // Use the formatted errors in the error message
            throw new Error(errors.map(err => err.message).join('; '));
        }

        return existingUsers; // Return an object with emails as keys and user info (id, userType, isArchived) as values
    } catch (err) {
        console.error('Error checking user existence by email:', err);
        throw err; // Propagate the error up to be caught by the route handler
    }
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

async function checkCsvSectionsExistsBySectionCode(csvData) {
    console.log('Checking if section codes exist');

    const errors = [];
    const existingSections = {}; // This can store any additional info if needed

    try {
        // Loop through all rows in the CSV data
        for (const row of csvData) {
            const { sectionCode } = row;

            // Check if the section code already exists in the database
            const existingSection = await Section.findOne({
                where: { sectionCode }
            });

            if (existingSection) {
                // Collect the formatted error if the section code already exists
                errors.push(formatError('sectionCode', `Section with section code ${sectionCode} already exists`));
            }
        }

        // If there are any errors, throw them after checking all rows
        if (errors.length > 0) {
            throw new Error(errors.map(err => err.message).join('; '));
        }

    } catch (err) {
        console.error('Error checking section code existence:', err);
        throw err; // Propagate the error to be caught in the route handler
    }
}



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
    checkCsvSectionsExistsBySectionCode,
    checkCsvForDuplicateEmails
 }