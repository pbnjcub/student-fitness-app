const { Section } = require('../../../models');

async function checkCsvForDuplicateSectionCode(req, res, next) {
    // Assuming the parsed CSV data is directly in req.body after parsing
    const sections = req.body; // Use the array directly from the body or a specific key if set differently
    console.log('Checking for duplicate section codes:', JSON.stringify(sections, null, 2));
    if (!Array.isArray(sections)) {
        return res.status(400).send("Invalid request: Expected an array of sections.");
    }

    const codes = new Set();
    const duplicates = [];

    for (const section of sections) {
        if (codes.has(section.sectionCode)) {
            duplicates.push(section.sectionCode);
        }
        codes.add(section.sectionCode);
    }

    if (duplicates.length > 0) {
        return res.status(400).send(`Duplicate section codes found: ${[...new Set(duplicates)].join(', ')}`);
    }

    next();
}


module.exports = { checkCsvForDuplicateSectionCode };
