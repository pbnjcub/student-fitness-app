const { Section } = require('../../../models');

async function checkSectionActive(req, res, next) {
    const { section } = req;

    if (!section.isActive) {
        const err = new Error(`Section with ID ${section.id} is not active`);
        err.status = 400;
        return next(err);
    }
    next();
}

module.exports = checkSectionActive;