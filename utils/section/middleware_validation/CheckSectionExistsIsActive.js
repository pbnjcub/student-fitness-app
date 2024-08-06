const { Section } = require('../../../models');

async function checkSectionExists(req, res, next) {
    const sectionId = req.params.sectionId || req.params.id;

    if (!sectionId || isNaN(sectionId)) {
        const err = new Error('Section ID must be an integer');
        err.status = 400;
        return next(err);
    }

    try {
        const section = await Section.findByPk(sectionId);
        if (!section) {
            const err = new Error(`Section with ID ${sectionId} not found`);
            err.status = 404;
            return next(err);
        }
        req.section = section; // Attach the section to the request object
        next();
    } catch (err) {
        console.error('Error checking section existence:', err);
        next(err); // Pass the error to the centralized error handler
    }
}


async function checkSectionIsActive(req, res, next) {
    const { section } = req;

    if (!section.isActive) {
        const err = new Error(`Section with ID ${section.id} is not active`);
        err.status = 400;
        return next(err);
    }
    next();
}


module.exports = { checkSectionExists, checkSectionIsActive };
