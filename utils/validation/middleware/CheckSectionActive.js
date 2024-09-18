const { Section } = require('../../../models');

function checkSectionActive(sectionKey = 'section') {
    return async (req, res, next) => {
        const section = req[sectionKey];
        
        if (!section || !section.isActive) {
            const err = new Error(`Section with ID ${section.id} is not active`);
            err.status = 400;
            return next(err);
        }
        next();
    };
}

module.exports = checkSectionActive;