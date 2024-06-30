const { User } = require('../../../models');

async function checkEmailExists(req, res, next) {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            const err = new Error(`User with email ${email} already exists`);
            err.status = 400;
            return next(err);
        }

        next();
    } catch (err) {
        console.error('Error checking email existence:', err);
        next(err);
    }
}

module.exports = { checkEmailExists };