const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import Models
const {
    sequelize,
    User,
    Section,
    SectionRoster,
    StudentDetail
} = require('../models');

//Import SectionDto
const { SectionDto, SectionByIdDto } = require('../utils/section/dto/SectionDto');

// Import Helper Functions
const {
    createSection,
    findSectionRoster, 
    createRosterEntries,
    switchRosterEntries,
    findSectionsByGradeLevel
} = require('../utils/section/helper_functions/SectionHelpers');

// Import Transaction Handler
const { handleTransaction } = require('../utils/HandleTransaction');

// Import CSV Handling Functions
const { checkCsvForDuplicateSectionCode, checkCsvForDuplicateEmails } = require('../utils/csv_handling/CsvExistingDataChecks');
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const sectionRowHandler = require('../utils/section/csv_handling/SectionCsvRowHandler');
const rosterSectionRowHandler = require('../utils/section/csv_handling/RosterSectionCsvRowHandler');

// Import validation middleware
const validate = require('../utils/validation/Validate');
const { createSectionValidationRules, updateSectionValidationRules } = require('../utils/section/middleware_validation/SectionReqObjValidation');
const rosterStudentsValidationRules = require('../utils/section/middleware_validation/RosterStudentsReqObjValidation');
const checkSectionActive = require('../utils/validation/middleware//CheckSectionActive');
const checkSectionExistsById = require('../utils/validation/middleware/CheckSectionExistsById');
const CheckSectionHasRosteredStudents = require('../utils/validation/middleware/CheckSectionHasRosteredStudents');
const checkSectionCodeExists = require('../utils/validation/middleware/CheckSectionCodeExists');
const checkStudentsToRosterInSection = require('../utils/validation/middleware/CheckStudentsToRosterInSection');
const checkStudentsToUnrosterFromSection = require('../utils/validation/middleware/CheckStudentsToUnrosterFromSection');
const { checkCsvUsersExistEmail, checkCsvUsersAreStudents, checkCsvUsersArchived } = require('../utils/csv_handling/CsvExistingDataChecks');
const checkStudentsExistById = require('../utils/validation/middleware/CheckStudentsExistById');
const checkStudentsUserType = require('../utils/validation/middleware/CheckStudentsUserType');
const checkSectionsExistByIdWhenTransferStudents = require('../utils/validation/middleware/CheckSectionsExistByIdWhenTransferStudents');
const checkStudentsActiveById = require('../utils/validation/middleware/CheckStudentsActiveById');
const checkStudentsRosteredInFromSection = require('../utils/validation/middleware/CheckStudentsRosteredInFromSection');
const checkStudentsAlreadyRosteredInToSection = require('../utils/validation/middleware/CheckStudentsAlreadyRosteredInToSection');
const checkStudentsRostered = require('../utils/validation/middleware/CheckStudentsRostered');
const transferStudentsValidationRules = require('../utils/section/middleware_validation/TransferStudentsReqObjValidation');
const checkGradeLevel = require('../utils/validation/middleware/CheckGradeLevel');
const { check } = require('express-validator');

// Add section
router.post('/sections',
    createSectionValidationRules(),
    validate,
    checkSectionCodeExists,
    async (req, res, next) => {
        try {
            const newSection = await createSection(req.body);
            const sectionDto = new SectionDto(newSection);
            return res.status(201).json(sectionDto);
        } catch (err) {
            next(err);
        }
    }
);

// Retrieve all sections
router.get('/sections', async (req, res, next) => {
    try {
        const sections = await Section.findAll();
        const sectionDtos = sections.map(section => new SectionDto(section));
        res.json(sectionDtos);
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
        const sectionDtos = activeSections.map(section => new SectionDto(section));
        res.json(sectionDtos);
    } catch (err) {
        next(err);
    }
});

// Retrieve sections by grade level
router.get('/sections/grade',
    checkGradeLevel,
    async (req, res, next) => {
    const { validatedGrades } = req;

    try {
        const sections = await findSectionsByGradeLevel(validatedGrades);
        res.json(sections);  // Send the raw sections as the response
    } catch (err) {
        console.error('Error retrieving sections by grade:', err);
        next(err);
    }
});

// Retrieve section by id
router.get('/sections/:id',
    checkSectionExistsById,
    async (req, res, next) => {
        const { section } = req;

        try {
            const sectionRoster = await findSectionRoster(section.id);
            section.sectionRoster = sectionRoster;
            const sectionWithRoster = new SectionByIdDto(section);
            res.json(sectionWithRoster);
        } catch (err) {
            next(err);
        }
    }
);

// Bulk upload from CSV
router.post('/sections/upload-csv',
    upload.single('file'),
    async (req, res, next) => {
        try {
            const buffer = req.file.buffer;
            const content = buffer.toString();
            const newSections = await processCsv(content, sectionRowHandler);

            //check newSections for duplicate sectionCodes
            await checkCsvForDuplicateSectionCode(newSections);

            // Create sections in a transaction
            await handleTransaction(async (transaction) => {
                for (const section of newSections) {
                    await createSection(section, transaction);
                }
            });

            const sections = await Section.findAll();
            const sectionDto = sections.map(section => new SectionDto(section.toJSON()));
            res.status(201).json(sectionDtos);
        } catch (err) {
            console.error('Error in POST /sections/upload-csv', err);
            next(err);
        }
});

// Edit section by id
router.patch('/sections/:id',
    updateSectionValidationRules(), // Validate the incoming data
    validate, // Run validation and handle any validation errors
    checkSectionExistsById, // Ensure the section exists before proceeding
    CheckSectionHasRosteredStudents, // Final check for rostered students and handle isActive status change
    async (req, res, next) => {
        const { section } = req;
        try {
            await section.update(req.body);
            const updatedSection = await Section.findByPk(section.id);
            const sectionDto = new SectionDto(updatedSection);
            res.status(200).json(sectionDto);
        } catch (err) {
            console.error('Error updating section:', err);
            next(err);
        }
    }
);

// Delete section
router.delete('/sections/:id',
    checkSectionExistsById,
    CheckSectionHasRosteredStudents,
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
    rosterStudentsValidationRules(),
    validate,
    checkStudentsExistById,
    checkStudentsUserType,
    checkStudentsActiveById,
    checkStudentsRostered,
    checkSectionExistsById,
    checkSectionActive(),
    async (req, res, next) => {
        const { section } = req;
        try {
            await handleTransaction(async (transaction) => {
                const rosteredStudents = await createRosterEntries(req.existingStudents, section.id, transaction);
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
    checkSectionExistsById,
    checkStudentsToUnrosterFromSection,
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
router.post('/sections/:sectionId/roster-students-by-csv', 
    upload.single('file'),
    async (req, res, next) => {
        try {
            const buffer = req.file.buffer;
            const content = buffer.toString();
            const { sectionId } = req.params;
            
            // Process the CSV content and validate each row
            const newStudents = await processCsv(content, rosterSectionRowHandler);

            console.log('newStudents:', newStudents);
            // Check for duplicate student IDs
            await checkCsvForDuplicateEmails(newStudents);

            const existingUsers = await checkCsvUsersExistEmail(newStudents);

            // Check if existingUsers' userTypes are "student"
            checkCsvUsersAreStudents(existingUsers);

            console.log(('existingUsers after successful userRole check:', existingUsers));

            // Check if existingUsers are archived
            checkCsvUsersArchived(existingUsers);

            // Attach the student IDs to the student objects
            newStudents.forEach(student => {
                student.id = existingUsers[student.email]; // Attach the student ID to the student object
            });

            // Handle the transaction and create roster entries
            await handleTransaction(async (transaction) => {
                const rosteredStudents = await createRosterEntries(newStudents, sectionId, transaction);
                res.status(201).json({ success: 'File uploaded and processed successfully', rosteredStudents });
            });

        } catch (err) {
            console.error('Error uploading file:', err);
            next(err); // Pass the error to the centralized error handler
        }
    }
);

router.post('/sections/transfer-students', 
    transferStudentsValidationRules(), // Validate the incoming data types, etc.
    validate, // Handle any validation errors
    checkStudentsExistById, // Check if student IDs exist and are valid
    checkStudentsActiveById,// Check if students are active and not archived
    checkSectionsExistByIdWhenTransferStudents, // Check if sections exist
    checkSectionActive('toSection'), // Check if the toSection is active
    checkStudentsRosteredInFromSection, // Check if students are in the fromSection
    checkStudentsAlreadyRosteredInToSection, // Check if students are already in the to
    async (req, res, next) => {
        try {
            const { fromSectionId, toSectionId } = req.body;
            const validSectionStudents = req.validSectionStudents;

            // Handle the transaction to switch students between sections
            await handleTransaction(async (transaction) => {
                const switchedStudents = await switchRosterEntries(validSectionStudents, fromSectionId, toSectionId, transaction);
                res.status(200).json({ success: 'Students switched successfully', switchedStudents });
            });

        } catch (err) {
            console.error('Error switching students:', err);
            next(err); // Pass the error to the centralized error handler
        }
    }
);




module.exports = router;
