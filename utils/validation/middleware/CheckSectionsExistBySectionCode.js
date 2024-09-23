const { Section } = require('../../../models');

async function checkSectionsExistBySectionCode(req, res, next) {
    console.log('Checking if section code(s) exist');

    let sections = req.body.sections;

    // Handle both single and multiple sections
    if (!Array.isArray(sections)) {
        sections = [sections];
    }

    try {
        const sectionCodes = sections.map(section => section.sectionCode);
        
        // Query the database to check for any existing sections with those section codes
        const existingSections = await Section.findAll({
            where: {
                sectionCode: sectionCodes
            }
        });

        if (existingSections.length > 0) {
            const existingCodes = existingSections.map(section => section.sectionCode);
            const err = new Error(`Sections with the following section codes already exist: ${existingCodes.join(', ')}`);
            err.status = 400;
            return next(err);
        }

        next(); // Proceed if no existing sections were found
    } catch (err) {
        console.error('Error checking section code existence:', err);
        next(err);
    }
}

module.exports = checkSectionsExistBySectionCode;
