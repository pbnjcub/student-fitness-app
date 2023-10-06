const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Here, you would typically start a session, issue a token, etc.
        res.status(200).json({ success: 'Logged in successfully' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.clearCookie('connect.sid'); // This might be different depending on your setup. 'connect.sid' is the default cookie name for express-session.
        res.status(200).json({ success: 'Logged out successfully' });
    });
});

module.exports = router;
