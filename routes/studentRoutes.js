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
          // Bulk create students and, if successful, commit the transaction
          await Student.bulkCreate(results.data, { transaction, ignoreDuplicates: true });
          await transaction.commit();
          
          res.status(200).json({ success: 'File uploaded and processed successfully' });
        } catch (error) {
          // If an error occurs, rollback the transaction
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

module.exports = router;
