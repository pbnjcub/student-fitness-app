const { User, StudentAnthro } = require('../models'); // Ensure User model is imported

async function recordAnthroData(email, anthroData, transaction) {
    try {
        // Find the user by email to get the studentUserId
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            throw new Error('User not found for the provided email');
        }

        const studentUserId = user.id;  // Assuming 'id' is the user identifier

        const mainAnthroData = {
            studentUserId: studentUserId,
            teacherUserId: anthroData.teacherUserId,
            height: anthroData.height,
            weight: anthroData.weight,
            dateRecorded: anthroData.dateRecorded || new Date(),
        };

        // Create a new record using the found studentUserId
        const newAnthro = await StudentAnthro.create(mainAnthroData, { transaction: transaction });
        return newAnthro;
    } catch (err) {
        console.error('Failed to record anthropometric data:', err);
        throw err;  // Rethrow the error to ensure it is handled or results in a transaction rollback
    }
}

const checkCsvForDuplicateEmails = async (anthroData) => {
    console.log('Checking for duplicate emails:', JSON.stringify(anthroData, null, 2));
    const emails = new Set();
    const duplicates = [];

    for (const anthro of anthroData) {
        if (emails.has(anthro.email)) {
            duplicates.push(anthro.email);
        }
        emails.add(anthro.email);
    }

    console.log('Duplicate emails:', duplicates);
    if (duplicates.length > 0) {
        throw new Error(`Duplicate emails found: ${[...new Set(duplicates)].join(', ')}`);
    }
};

module.exports = {
    checkCsvForDuplicateEmails
};

module.exports = {
    recordAnthroData
};  
