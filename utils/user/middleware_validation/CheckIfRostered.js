const { SectionRoster, User } = require('../../../models');

async function checkIfRostered(req, res, next) {
    const { id } = req.params;
    const { isArchived } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach the user to the request object for further use

        const isRostered = await SectionRoster.count({ where: { studentUserId: id } });
        req.isRostered = isRostered > 0; // Set boolean flag indicating if the student is rostered

        // Check if isArchived status change is blocked
        if (user.isArchived === false && typeof isArchived === 'boolean' && user.isArchived !== isArchived) {
            if (req.isRostered) {
                return res.status(400).json({
                    errs: [
                        {
                            field: 'isArchived',
                            message: 'Student is rostered in a section and cannot be archived.'
                        }
                    ]
                });
            }
        }

        next(); // Proceed to the next middleware if all checks pass
    } catch (err) {
        console.error('Error checking if student is rostered:', err);
        next(err);  // Pass the error to the centralized error handler
    }
}

module.exports = { checkIfRostered };
