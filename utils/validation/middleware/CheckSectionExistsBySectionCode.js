const { Section } = require('../../../models');

async function checkSectionExistsBySectionCode(req, res, next) {
    console.log('Checking if section code exists')
    const { sectionCode } = req.body;

    try {
        const existingSection = await Section.findOne({ where: { sectionCode } });
        if (existingSection) {
            const err = new Error(`Section with section code ${sectionCode} already exists`);
            err.status = 400;
            return next(err);
        }
        next();
    } catch (err) {
        console.error('Error checking section code existence:', err);
        next(err);
    }
}

module.exports = checkSectionExistsBySectionCode;