const { StudentAnthro } = require('../../../models'); // Adjust path as necessary

async function checkAnthroExists(req, res, next) {
    const studentUserId = req.params.id; // Assuming the student ID is in the route parameter

    try {
        const existingAnthro = await StudentAnthro.findOne({
            where: { studentUserId }
        });

        if (!existingAnthro) {
            const err = new Error(`No anthropometric data found for student ID ${studentUserId}`);
            err.status = 404; // Not found
            return next(err);
        } else {
            // Attach the existing data to the request object
            req.existingAnthro = existingAnthro;
        }

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Error checking existing anthropometric data:', err);
        next(err);
    }
}

module.exports = checkAnthroExists;