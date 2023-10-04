const express = require('express');
const router = express.Router();
const { User, StudentDetail } = require('../models');

// Retrieve all student users
router.get('/students', async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        userType: 'student'
      },
      include: [{
        model: StudentDetail,
        as: 'studentDetails'
      }]
    });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server error');
  }
});

// Other student-specific routes can go here...

module.exports = router;
