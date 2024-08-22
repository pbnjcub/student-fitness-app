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

module.exports = {
    checkCsvForDuplicateSectionCode,
    checkCsvForDuplicateEmails
};