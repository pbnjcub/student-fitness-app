const express = require('express');
const router = express.Router();
const { Student } = require('../models'); // Updated import

// Define a route to retrieve all students
router.get('/students', async (req, res) => {
  try {
    // Retrieve all students from the database
    const students = await Student.findAll();

    // Send the retrieved students as a JSON response
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
