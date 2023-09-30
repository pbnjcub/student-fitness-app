const express = require('express');
const multer = require('multer');
const { Student, sequelize } = require('../models'); // Import sequelize instance along with Student Model
const Papa = require('papaparse');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        // Start a transaction
        const transaction = await sequelize.transaction();
        
        try {
          const newStudents = []; // Array to hold newly added students
          for(const studentData of results.data) {
            const [student, created] = await Student.findOrCreate({
              where: { email: studentData.email },
              defaults: studentData,
              transaction
            });
            if(created) newStudents.push(student); // If student is new, add to newStudents array
          }
          await transaction.commit();

          // Send newly added students as response
          res.status(200).json({ success: 'File uploaded and processed successfully', newStudents });
          
        } catch (error) {
          await transaction.rollback();
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      },
    });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/students', async (req, res) => {
  // Extracting information about the student from the request body.
  const { email, password, firstName, lastName, birthDate, gradYear } = req.body;
  
  // You can add validations here to check whether the required fields are present or not.
  if(!email || !password || !firstName || !lastName || !birthDate || !gradYear) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
      // Attempt to create the student in the database.
      const student = await Student.create({ 
          email,
          password, 
          firstName, 
          lastName, 
          birthDate, 
          gradYear 
          //... add other fields as necessary
      });

      // If successful, return the created student.
      res.status(201).json(student);
  } catch (error) {
      console.error('Error in creating student:', error);
      
      // If an error occurs, return a 500 Internal Server Error status code and a message.
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;

