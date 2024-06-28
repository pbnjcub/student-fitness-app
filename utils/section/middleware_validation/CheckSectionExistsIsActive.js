const { Section } = require('../../../models');

async function checkSectionExists(req, res, next) {
    console.log('Checking if section exists')
    const { id } = req.params;

    if (isNaN(id)) {
        const err = new Error('Section ID must be an integer');
        err.status = 400;
        return next(err);
    }

    try {
        const section = await Section.findByPk(id);
        if (!section) {
            const err = new Error(`Section with ID ${id} not found`);
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
    console.log('Checking if section is active')
    const { section } = req;

    if (!section.isActive) {
        const err = new Error(`Section with ID ${section.id} is not active`);
        err.status = 400;
        return next(err);
    }
    next();
}


module.exports = { checkSectionExists, checkSectionIsActive };
