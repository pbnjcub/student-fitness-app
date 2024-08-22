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

module.exports = {
    checkCsvForDuplicateEmails
};