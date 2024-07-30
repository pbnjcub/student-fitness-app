const { SectionRoster } = require('../../../models');

async function checkIfRostered(req, res, next) {
    const { id } = req.params;

    try {
        const isRostered = await SectionRoster.count({ where: { studentUserId: id } });
        req.isRostered = isRostered > 0; // Set boolean flag indicating if the student is rostered
        next();
    } catch (err) {
        console.log('Error checking if student is rostered:', err);
        next(err);  // Pass the error to the centralized error handler
    }
}

module.exports = { checkIfRostered };
