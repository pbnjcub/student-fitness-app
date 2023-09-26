const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Import your Student model using CommonJS

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


// import express from 'express';
// const router = express.Router();
// import { Student } from '../models/Student.js'; // Import your Student model

// // Define a route to retrieve all students
// router.get('/students', async (req, res) => {
//   try {
//     // Retrieve all students from the database
//     const students = await Student.findAll();

//     // Send the retrieved students as a JSON response
//     res.json(students);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;
