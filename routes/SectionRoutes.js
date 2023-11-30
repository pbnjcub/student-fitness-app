const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { sequelize } = require('../models');
const { User, Section } = require('../models');


//helper functions
function sectionDTO(section) {
    return {
        id: section.id,
        sectionCode: section.sectionCode,
    }
}

const checkRequired = (sectionData) => {
    const { sectionCode } = sectionData;
  
    const missingFields = [];
    
    if (!sectionCode) missingFields.push('Section Code');
  
    return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
  }

  // Helper function to create a section
async function createSection(sectionData, transaction) {
    const { sectionCode } = sectionData;

    try {
        const newSection = await Section.create({ sectionCode }, { transaction });

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


// Retrieve all modules
router.get('/sections', async (req, res) => {

  try {
    const sections = await Section.findAll();

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).send('Server error');
  }
});

//retrieve only active modules
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

//add modules from csv
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

module.exports = router;