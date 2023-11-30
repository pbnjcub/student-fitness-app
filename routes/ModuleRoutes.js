const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { sequelize } = require('../models');
const { User, Module } = require('../models');


//helper functions
function moduleDTO(module) {
    return {
        id: module.id,
        title: module.title,
        moduleLevel: module.moduleLevel,
        description: module.description,
        isActive: module.isActive
    }
}

const checkRequired = (moduleData) => {
    const { title, moduleLevel, isActive } = moduleData;
  
    const missingFields = [];
    
    if (!title) missingFields.push('Title');
    if (!moduleLevel) missingFields.push('moduleLevel');
    // if (!isActive) missingFields.push('isActive');
  
    return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
  }

  // Helper function to create a module
async function createModule(moduleData, transaction) {
    const { title, moduleLevel, description, isActive } = moduleData;

    try {
        const newModule = await Module.create({
            title,
            moduleLevel,
            description,
            isActive
        }, { transaction });

        return { newModule, error: null };
    } catch (error) {
        return { newModule: null, error: error.message };
    }
}

//Helper function to check if module exists
async function moduleExists(title) {
    const module = await Module.findOne({ where: { title } });
    return module ? true : false;
}


// Retrieve all modules
router.get('/modules', async (req, res) => {
    console.log(`Starting GET /modules...`);
  try {
    const modules = await Module.findAll();

    res.json(modules);
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).send('Server error');
  }
});

//retrieve only active modules
router.get('/modules/active', async (req, res) => {
  try {
    const modules = await Module.findAll({
      where: {
        isActive: true
      }
    });

    res.json(modules);
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).send('Server error');
  }
});

//add module
router.post('/modules', async (req, res) => {
  try {
    const requiredCheck = checkRequired(req.body);
    if (requiredCheck !== true) {
        return res.status(400).json({ error: requiredCheck });
    }

    const existingModule = await moduleExists(req.body.title);
    if (existingModule === true) {
        return res.status(400).json({ error: `Module with title ${req.body.title} already exists` });
    }

    const transaction = await sequelize.transaction();

    const { newModule, error } = await createModule(req.body, transaction);

    if (error) {
        await transaction.rollback();
        throw new Error(error);
    }

    await transaction.commit();

    res.status(201).json(moduleDTO(newModule));
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).send('Server error');
  }
});

//add modules from csv
router.post('/modules/upload', upload.single('file'), async (req, res) => {

    try {
        const buffer = req.file.buffer;
        const content = buffer.toString();

        const newModules = [];
        const errors = [];

        Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            complete: async (results) => {
                const transaction = await sequelize.transaction();
                try {
                    for (const moduleData of results.data) {
                        const requiredCheck = checkRequired(moduleData);
                        if (requiredCheck !== true) {
                            errors.push({ moduleData, error: requiredCheck });
                            continue; // Skip to the next iteration
                        }

                        const existingModule = await moduleExists(moduleData.title);
                        if (existingModule === true) {
                            errors.push({ moduleData, error: `Module with title ${moduleData.title} already exists` });
                            continue; // Skip to the next iteration
                        }

                        const { newModule, error } = await createModule(moduleData, transaction);

                        if (error) {
                            errors.push({ moduleData, error });
                            continue; // Skip to the next iteration
                        }

                        newModules.push(moduleDTO(newModule));
                    }

                    if (errors.length > 0) {
                        await transaction.rollback();
                        res.status(400).json({ error: 'Some modules could not be processed', details: errors });
                    } else {
                        await transaction.commit();
                        res.status(201).json({ success: 'File uploaded and processed successfully', newModules });
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


//retrieve module by id
router.get('/modules/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Starting GET /modules/${id}...`);

  try {
    const module = await Module.findByPk(id);

    if (!module) {
      console.log(`Module with ID ${id} not found.`);
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(module);
  } catch (err) {
    console.error('Error fetching module:', err);
    res.status(500).send('Server error');
  }
});

//edit module
router.patch('/modules/:id', async (req, res) => {
  const { id } = req.params;

  const { title, moduleLevel, description, isActive } = req.body;


  if (!id) return res.status(400).json({ error: 'Module ID is required' });

 
  try {
    
    const transaction = await sequelize.transaction();

    const module = await Module.findByPk(id, { transaction });

    if (!module) {
      await transaction.rollback();
      console.log(`Module with ID ${id} not found.`);
      return res.status(404).json({ error: 'Module not found' });
    }

    console.log(`Found module:`, module.toJSON());

    const updatedValues = {};
    if (title && title !== module.title) updatedValues.title = title;
    if (moduleLevel && moduleLevel !== module.moduleLevel) updatedValues.moduleLevel = moduleLevel;
    if (description && description !== module.description) updatedValues.description = description;
    if (isActive && isActive !== module.isActive) updatedValues.isActive = isActive;

    await module.update(updatedValues, { transaction });

    await transaction.commit();

    res.status(200).json(module);
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).send('Server error');
  }
});

//delete module
router.delete('/modules/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Starting DELETE /modules/${id}...`);

  if (!id) return res.status(400).json({ error: 'Module ID is required' });

  try {
    const transaction = await sequelize.transaction();

    const module = await Module.findByPk(id, { transaction });

    if (!module) {
      await transaction.rollback();
      console.log(`Module with ID ${id} not found.`);
      return res.status(404).json({ error: 'Module not found' });
    }

    console.log(`Found module:`, module.toJSON());

    await module.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ success: `Module with ID ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting module:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;