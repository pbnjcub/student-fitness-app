const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { sequelize, User, Section, SectionRoster, StudentDetail } = require('../models');

// Import helper functions
const { SectionDTO, SectionByIdDTO } = require('../utils/section/dto/SectionDTO');
const { createSection, findSectionRoster, handleTransaction, createRosterEntries } = require('../utils/section/helper_functions/SectionHelpers');
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const sectionRowHandler = require('../utils/section/csv_handling/SectionCSVRowHandler');

// Import validation middleware
const { createSectionValidationRules, updateSectionValidationRules } = require('../utils/section/middleware_validation/SectionReqObjValidation');
const validate = require('../utils/validation/ValidationMiddleware');
const { checkSectionExists, checkSectionIsActive } = require('../utils/section/middleware_validation/CheckSectionExistsIsActive');
const { hasRosteredStudents } = require('../utils/section/middleware_validation/CheckHasRosteredStudents');
const { checkSectionCodeExists } = require('../utils/section/middleware_validation/CheckSectionCodeExists');
const { validateRoster, validateUnroster } = require('../utils/section/middleware_validation/CheckStudentsToRosterInSection');

// Add section
router.post('/sections',
    createSectionValidationRules(),
    validate,
    checkSectionCodeExists,
    async (req, res, next) => {
        try {
            const newSection = await createSection(req.body);
            const sectionDto = new SectionDTO(newSection);
            return res.status(201).json(sectionDto);
        } catch (err) {
            next(err);
        }
});

// Retrieve all sections
router.get('/sections', async (req, res, next) => {
    try {
        const sections = await Section.findAll();
        const sectionDTOs = sections.map(section => new SectionDTO(section));
        res.json(sectionDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve only active sections
router.get('/sections/active', async (req, res, next) => {
    try {
        const activeSections = await Section.findAll({
            where: {
                isActive: true
            }
        });
        const sectionDTOs = activeSections.map(section => new SectionDTO(section));
        res.json(sectionDTOs);
    } catch (err) {
        next(err);
    }
});

// Retrieve section by id
router.get('/sections/:id',
    checkSectionExists,
    async (req, res, next) => {
        const { section } = req;

        try {
            const sectionRoster = await findSectionRoster(section.id);
            section.sectionRoster = sectionRoster;
            const sectionWithRoster = new SectionByIdDTO(section);
            res.json(sectionWithRoster);
        } catch (err) {
            next(err);
        }
    }
);

// Bulk upload from CSV
router.post('/sections/upload-csv', upload.single('file'), async (req, res, next) => {
    try {
        const buffer = req.file.buffer;
        const content = buffer.toString();
        const newSections = await processCsv(content, sectionRowHandler);

        // Create sections in a transaction
        await handleTransaction(async (transaction) => {
            for (const section of newSections) {
                await createSection(section, transaction);
            }
        });

        const sections = await Section.findAll();
        const sectionsDTO = sections.map(section => new SectionDTO(section.toJSON()));
        res.status(201).json(sectionsDTO);
    } catch (err) {
        console.error('Error in POST /sections/upload-csv', err);
        next(err);
    }
});

// Edit section by id
router.patch('/sections/:id',
    checkSectionExists,
    updateSectionValidationRules(),
    validate,
    hasRosteredStudents,
    // check if section is still associated with a module through sectionenrollments.
    async (req, res, next) => {
        const { section } = req;
        const { isActive } = req.body;
        try {
            if (section.isActive && typeof isActive === 'boolean' && section.isActive !== isActive) {
                if (req.hasRosteredStudents) {
                    const err = new Error('Section has rostered students and cannot change isActive status.');
                    err.status = 400;
                    return next(err);
                }
            }
            await section.update(req.body);
            const updatedSection = await Section.findByPk(section.id);
            const sectionDTO = new SectionDTO(updatedSection);
            res.status(200).json(sectionDTO);
        } catch (err) {
            console.error('Error updating section:', err);
            next(err);
        }
    }
);

// Delete section
router.delete('/sections/:id',
    checkSectionExists,
    hasRosteredStudents,
    async (req, res, next) => {
        const { section } = req;

        try {
            await section.destroy();
            res.status(200).json({ message: `Section with ID ${section.id} successfully deleted` });
        } catch (err) {
            console.error('Error deleting section:', err);
            next(err);
        }
    });

// Route to roster a student user to a section
router.post('/sections/:sectionId/roster-students',
    checkSectionExists,
    checkSectionIsActive,
    validateRoster,
    async (req, res, next) => {
        const { section } = req;
        try {
            await handleTransaction(async (transaction) => {
                const rosteredStudents = await createRosterEntries(req.validatedStudents, section.id, transaction);
                res.json({ rosteredStudents, message: `${rosteredStudents.length} student(s) added to the roster` });
            });
        } catch (err) {
            console.error('Error rostering students:', err);
            next(err);
        }
    }
);

// Route to unenroll student from section
router.delete('/sections/:sectionId/unroster-students',
    checkSectionExists,
    validateUnroster,
    async (req, res, next) => {
        const { section } = req;

        try {
            await handleTransaction(async (transaction) => {
                const unrosteredStudents = [];
                for (const student of req.validatedStudents) {
                    const sectionRoster = await SectionRoster.findOne({
                        where: { studentUserId: student.id, sectionId: section.id },
                        transaction
                    });
                    if (sectionRoster) {
                        await sectionRoster.destroy({ transaction });
                        unrosteredStudents.push(sectionRoster);
                    }
                }
                res.json({ unrosteredStudents, message: `${unrosteredStudents.length} student(s) removed from the roster` });
            });
        } catch (err) {
            console.error('Error unrostering students:', err);
            next(err);
        }
    }
);

// Roster students from CSV
router.post('/sections/:sectionId/roster-students-upload-csv', upload.single('file'), async (req, res, next) => {
    try {
        const buffer = req.file.buffer;
        const content = buffer.toString();
        const { sectionId } = req.params;
        const newStudents = await processCsv(content, async (row, rowNumber) => await rosterToSectionRowHandler(row, rowNumber, sectionId));
        const transaction = await sequelize.transaction();
        const processedIds = new Set();
        const rosteredStudents = [];
        const errors = [];
        for (const { studentUserId, sectionId } of newStudents) {
            if (processedIds.has(studentUserId)) {
                errors.push({ studentUserId, sectionId, error: 'Duplicate student ID found' });
                continue;
            }
            processedIds.add(studentUserId);
            const sectionRoster = await SectionRoster.create({ studentUserId, sectionId }, { transaction });
            rosteredStudents.push(sectionRoster);
        }
        if (errors.length > 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Some students could not be rostered', details: errors });
        }
        await transaction.commit();
        res.status(201).json({ success: 'File uploaded and processed successfully', rosteredStudents });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
