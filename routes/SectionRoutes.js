const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { sequelize } = require('../models');
const { User, Section, SectionRoster, StudentDetail } = require('../models');


//helper functions
function sectionDTO(section) {
    return {
        id: section.id,
        sectionCode: section.sectionCode,
        gradeLevel: section.gradeLevel,
        isActive: section.isActive
    }
}

const checkRequired = (sectionData) => {
    const { sectionCode, gradeLevel } = sectionData;
  
    const missingFields = [];
    
    if (!sectionCode) missingFields.push('Section Code');
    if (!gradeLevel) missingFields.push('Grade Level');
  
    return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
  }

  // Helper function to create a section
async function createSection(sectionData, transaction) {
    const { sectionCode, gradeLevel, isActive } = sectionData;

    try {
        const newSection = await Section.create({ sectionCode, gradeLevel, isActive }, { transaction });

        return { newSection, error: null };
    } catch (error) {
        return { newSection: null, error: error.message };
    }
}

//Helper function to check if section exists
async function sectionExists(sectionCode) {
    const section = await Section.findOne({ where: { sectionCode } });
    return section ? true : false;
}

//find current academic year
function getAcademicYear() { 
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  if (currentMonth >= 8) {
      return currentYear + 1;
  } else {
      return currentYear;
  }
}

//find current grade level of student user
function getGradeLevel(studentUser) {
  const studentGradYear = studentUser.studentDetails.gradYear;

  if (typeof studentGradYear !== 'number' || studentGradYear < new Date().getFullYear()) {
      // Handle invalid or past graduation year
      return 'Invalid or past graduation year';
  }

  const currentAcademicYear = getAcademicYear();
  const yearsRemaining = studentGradYear - currentAcademicYear;

  if (yearsRemaining < 0) {
      // Student has already graduated
      return 'Graduated';
  } else if (yearsRemaining > 12) {
      // Student is younger than 1st grade
      return 'Pre-Grade 1';
  }

  const currentGradeLevel = 12 - yearsRemaining;
  return currentGradeLevel <= 0 ? 'Kindergarten or younger' : currentGradeLevel;
}



// Retrieve all sections
router.get('/sections', async (req, res) => {

  try {
    const sections = await Section.findAll();

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).send('Server error');
  }
});

//retrieve only active sections
router.get('/sections/active', async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: {
        isActive: true
      }
    });

    res.json(sections);
  } catch (err) {
    console.error('Error fetching sections:', err);
    res.status(500).send('Server error');
  }
});

//add section
router.post('/sections', async (req, res) => {
  try {
    const requiredCheck = checkRequired(req.body);
    if (requiredCheck !== true) {
        return res.status(400).json({ error: requiredCheck });
    }

    const existingSection = await sectionExists(req.body.sectionCode);
    if (existingSection === true) {
        return res.status(400).json({ error: `Section with code ${req.body.sectionCode} already exists` });
    }

    const transaction = await sequelize.transaction();

    const { newSection, error } = await createSection(req.body, transaction);

    if (error) {
        await transaction.rollback();
        throw new Error(error);
    }

    await transaction.commit();

    res.status(201).json(sectionDTO(newSection));
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).send('Server error');
  }
});

//add sections from csv
router.post('/sections/upload', upload.single('file'), async (req, res) => {

    try {
        const buffer = req.file.buffer;
        const content = buffer.toString();

        const newSections = [];
        const errors = [];

        Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            complete: async (results) => {
                const transaction = await sequelize.transaction();
                try {
                    for (const sectionData of results.data) {
                        const requiredCheck = checkRequired(sectionData);
                        if (requiredCheck !== true) {
                            errors.push({ sectionData, error: requiredCheck });
                            continue; // Skip to the next iteration
                        }

                        const existingSection = await sectionExists(req.body.sectionCode);
                        if (existingSection === true) {
                            errors.push({ sectionData, error: `Section with code ${sectionData.sectionCode} already exists` });
                            continue; // Skip to the next iteration
                        }

                        const { newSection, error } = await createSection(sectionData, transaction);

                        if (error) {
                            errors.push({ sectionData, error });
                            continue; // Skip to the next iteration
                        }

                        newSections.push(sectionDTO(newSection));
                    }

                    if (errors.length > 0) {
                        await transaction.rollback();
                        res.status(400).json({ error: 'Some sections could not be processed', details: errors });
                    } else {
                        await transaction.commit();
                        res.status(201).json({ success: 'File uploaded and processed successfully', newSections });
                    }
                } catch (error) {
                    await transaction.rollback();
                    console.error('Error processing file:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//retrieve section by id
router.get('/sections/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Starting GET /sections/${id}...`);

  try {
    const section = await Section.findByPk(id);

    if (!section) {
      console.log(`Section with ID ${id} not found.`);
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).send('Server error');
  }
});

//edit section
router.patch('/sections/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'Section ID is required' });
 
  try {
    
    const transaction = await sequelize.transaction();

    const section = await Section.findByPk(id, { transaction });

    if (!section) {
      await transaction.rollback();
      console.log(`Section with ID ${id} not found.`);
      return res.status(404).json({ error: 'Section not found' });
    }

    console.log(`Found section:`, section.toJSON());

    const updatedValues = {};
    if (req.body.sectionCode) updatedValues.sectionCode = req.body.sectionCode;
    if (req.body.gradeLevel) updatedValues.gradeLevel = req.body.gradeLevel;
    if (req.body.isActive) updatedValues.isActive = req.body.isActive;

    await section.update(updatedValues, { transaction });

    await transaction.commit();

    res.status(200).json(section);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).send('Server error');
  }
});

//delete section
router.delete('/sections/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Starting DELETE /sections/${id}...`);

  if (!id) return res.status(400).json({ error: 'Section ID is required' });

  try {
    const transaction = await sequelize.transaction();

    const section = await Section.findByPk(id, { transaction });

    if (!section) {
      await transaction.rollback();
      console.log(`Section with ID ${id} not found.`);
      return res.status(404).json({ error: 'Section not found' });
    }

    console.log(`Found section:`, section.toJSON());

    await section.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ success: `Section with ID ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting section:', err);
    res.status(500).send('Server error');
  }
});

//route to roster a student user to a section
router.post('/sections/:sectionId/roster-student', async (req, res) => {
  const { sectionId } = req.params;
  const { studentUserId } = req.body;

  console.log(`Starting POST /sections/${sectionId}/roster...`);
  console.log(`Received request body:`, req.body);

  if (!sectionId) return res.status(400).json({ error: 'Section ID is required' });
  if (!studentUserId) return res.status(400).json({ error: 'Student User ID is required' });

  try {
      const transaction = await sequelize.transaction();

      const section = await Section.findByPk(sectionId, { transaction });
      if (!section) {
          await transaction.rollback();
          console.log(`Section with ID ${sectionId} not found.`);
          return res.status(404).json({ error: 'Section not found' });
      }
      console.log(`Found section:`, section.toJSON());

      const student = await User.findByPk(studentUserId, {
        include: [{ model: StudentDetail, as: 'studentDetails' }],
        transaction
      });
      if (!student || student.userType !== 'student') {
          await transaction.rollback();
          console.log(`Student with ID ${studentUserId} not found or not a student.`);
          return res.status(404).json({ error: 'Student not found or not a student' });
      }
      console.log(`Found student:`, student.toJSON());

      // Check if the student's grade level matches the section's grade level
      const studentGradeLevel = getGradeLevel(student);
      if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
          await transaction.rollback();
          return res.status(400).json({ 
              error: `Student's grade level does not match the section's grade level` 
          });
      }

      const sectionRoster = await SectionRoster.create({
          studentUserId: studentUserId,
          sectionId: sectionId
      }, { transaction });

      await transaction.commit();
      res.json(sectionRoster);
  } catch (error) {
      console.error('Error rostering student:', error);
      res.status(500).send('Server error');
  }
});

//roster students from csv
router.post('/sections/:sectionId/roster-students/upload', upload.single('file'), async (req, res) => {
  const { sectionId } = req.params;

  console.log(`Starting POST /sections/${sectionId}/roster-students/upload...`);
  console.log(`Received request body:`, req.body);

  if (!sectionId) return res.status(400).json({ error: 'Section ID is required' });

  try {
      const transaction = await sequelize.transaction();

      const section = await Section.findByPk(sectionId, { transaction });
      if (!section) {
          await transaction.rollback();
          console.log(`Section with ID ${sectionId} not found.`);
          return res.status(404).json({ error: 'Section not found' });
      }
      console.log(`Found section:`, section.toJSON());

      const buffer = req.file.buffer;
      const content = buffer.toString();

      const newRosterEntries = [];
      const errors = [];

      Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          complete: async (results) => {
              try {
                  for (const rosterData of results.data) {
                      const { studentUserId } = rosterData;

                      const student = await User.findByPk(studentUserId, { transaction });
                      if (!student || student.userType !== 'student') {
                          errors.push({ rosterData, error: `Student with ID ${studentUserId} not found or not a student` });
                          continue; // Skip to the next iteration
                      }

                      // Check if the student's grade level matches the section's grade level
                      const studentGradeLevel = getGradeLevel(student);
                      if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
                          errors.push({ rosterData, error: `Student's grade level does not match the section's grade level` });
                          continue; // Skip to the next iteration
                      }

                      const sectionRoster = await SectionRoster.create({
                          studentUserId: studentUserId,
                          sectionId: sectionId
                      }, { transaction });

                      newRosterEntries.push(sectionRoster);
                  }

                  if (errors.length > 0) {
                      await transaction.rollback();
                      res.status(400).json({ error: 'Some students could not be rostered', details: errors });
                  } else {
                      await transaction.commit();
                      res.status(201).json({ success : 'File uploaded and processed successfully', newRosterEntries });
                  }
              } catch (error) {
                  await transaction.rollback();
                  console.error('Error processing file:', error);
                  res.status(500).json({ error: 'Internal Server Error' });
              }
          }
      });
  } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}
);


module.exports = router;