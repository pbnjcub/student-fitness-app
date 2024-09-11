const { User } = require('../../../models');

async function checkUserExists(req, res, next) {
    const { id } = req.params;

    if (isNaN(id)) {
        const err = new Error('User ID must be an integer');
        err.status = 400;
        return next(err);
    }

    try {
        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error(`User with ID ${id} not found`);
            err.status = 404;
            return next(err);
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('Error checking user existence:', err);
        next(err);
    }
}

module.exports = checkUserExists;