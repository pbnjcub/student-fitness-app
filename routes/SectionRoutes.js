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
    removeRosterEntries,
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
const { createSectionsValidationRules, createSectionValidationRules, updateSectionValidationRules } = require('../utils/section/middleware_validation/SectionReqObjValidation');
const deleteSectionValidationRules = require('../utils/section/middleware_validation/DeleteSectionValidation');
const rosterStudentsValidationRules = require('../utils/section/middleware_validation/RosterStudentsReqObjValidation');
const checkSectionActive = require('../utils/validation/middleware//CheckSectionActive');
const checkSectionExistsById = require('../utils/validation/middleware/CheckSectionExistsById');
const checkSectionHasRosteredStudents = require('../utils/validation/middleware/CheckSectionHasRosteredStudents');
const checkSectionExistsBySectionCode = require('../utils/validation/middleware/CheckSectionExistsBySectionCode');
const checkSectionsExistBySectionCode = require('../utils/validation/middleware/CheckSectionsExistBySectionCode');
const checkStudentsToUnrosterFromSection = require('../utils/validation/middleware/CheckStudentsToUnrosterFromSection');
const { checkCsvUsersExistEmail, checkCsvUsersAreStudents, checkCsvUsersArchived, checkCsvSectionsExistsBySectionCode, checkCsvStudentsRostered } = require('../utils/csv_handling/CsvExistingDataChecks');
const checkStudentsExistById = require('../utils/validation/middleware/CheckStudentsExistById');
const checkStudentsUserType = require('../utils/validation/middleware/CheckStudentsUserType');
const checkSectionsExistByIdWhenTransferStudents = require('../utils/validation/middleware/CheckSectionsExistByIdWhenTransferStudents');
const checkStudentsArchivedById = require('../utils/validation/middleware/CheckStudentsArchivedById');
const checkStudentsRosteredInFromSection = require('../utils/validation/middleware/CheckStudentsRosteredInFromSection');
const checkStudentsAlreadyRosteredInToSection = require('../utils/validation/middleware/CheckStudentsAlreadyRosteredInToSection');
const checkStudentsRostered = require('../utils/validation/middleware/CheckStudentsRostered');
const transferStudentsValidationRules = require('../utils/section/middleware_validation/TransferStudentsReqObjValidation');
const checkGradeLevel = require('../utils/validation/middleware/CheckGradeLevel');
const checkStudentsDuplicateIds = require('../utils/validation/middleware/CheckStudentsDuplicateIds');
const checkStudentsRosteredInSection = require('../utils/validation/middleware/CheckStudentsRosteredInSection');

// Import error handling helpers
const { formatError } = require('../utils/error_handling/ErrorHandler');

// Add section
router.post('/sections',
    createSectionsValidationRules(), // Validation for one or more sections
    validate, // Run validation and handle any validation errors
    checkSectionsExistBySectionCode, // Check if the section code(s) already exist
    async (req, res, next) => {
        try {
            let sections = req.body.sections;

            // If it's a single section, convert it to an array for uniform processing
            if (!Array.isArray(sections)) {
                sections = [sections];
            }

            const createdSections = [];
            await handleTransaction(async (transaction) => {
                for (const sectionData of sections) {
                    const newSection = await createSection(sectionData, transaction);
                    createdSections.push(new SectionDto(newSection)); // Add the DTO for each created section
                }
            });

            // Return the created sections
            return res.status(201).json({ sections: createdSections });
        } catch (err) {
            console.error('Error creating sections:', err);
            next(err);
        }
    }
);

// router.post('/sections',
//     createSectionValidationRules(),
//     validate,
//     checkSectionExistsBySectionCode,
//     async (req, res, next) => {
//         try {
//             const newSection = await createSection(req.body);
//             const sectionDto = new SectionDto(newSection);
//             return res.status(201).json(sectionDto);
//         } catch (err) {
//             next(err);
//         }
//     }
// );

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
router.get('/sections/by-grade-level',
    checkGradeLevel,
    async (req, res, next) => {
    const { validatedGradeLevels } = req;

    try {
        const sections = await findSectionsByGradeLevel(validatedGradeLevels);
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

            await checkCsvForDuplicateSectionCode(newSections);
            await checkCsvSectionsExistsBySectionCode(newSections);

            await handleTransaction(async (transaction) => {
                for (const section of newSections) {
                    await createSection(section, transaction);
                }
            });

            const sections = await Section.findAll();
            const sectionDtos = sections.map(section => new SectionDto(section.toJSON()));
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
    checkSectionHasRosteredStudents, // Check for rostered students but leave logic to this route
    async (req, res, next) => {
        const { section, hasRosteredStudents } = req;
        const { isActive } = req.body; // Grab the isActive field from the request body if it's there

        try {
            // Handle isActive change validation with rostered students
            if (section.isActive && typeof isActive === 'boolean' && section.isActive !== isActive) {
                if (hasRosteredStudents) {
                    return res.status(400).json({
                        errs: [
                            formatError('isActive', 'Section has rostered students and cannot change isActive status.')
                        ]
                    });
                }
            }

            // If no issue with isActive, proceed with updating the section
            await section.update(req.body); // Update with the request body
            const updatedSection = await Section.findByPk(section.id); // Refetch the updated section
            const sectionDto = new SectionDto(updatedSection); // Convert to DTO for response

            res.status(200).json(sectionDto); // Send the updated section as the response
        } catch (err) {
            console.error('Error updating section:', err);
            next(err); // Pass the error to the centralized error handler
        }
    }
);

// Delete section
router.delete('/sections/:id',
    deleteSectionValidationRules(),
    validate,
    checkSectionExistsById, // Middleware to check if the section exists
    checkSectionHasRosteredStudents, // Middleware to check for rostered students
    async (req, res, next) => {
        const { section, hasRosteredStudents } = req;

        try {
            // If the section has rostered students, prevent deletion
            if (hasRosteredStudents) {
                return res.status(400).json({
                    errs: [
                        formatError('delete', 'Section has rostered students and cannot be deleted.')
                    ]
                });
            }

            // Proceed with deletion if no rostered students
            await section.destroy();
            res.status(200).json({ message: `Section with ID ${section.id} successfully deleted` });
        } catch (err) {
            console.error('Error deleting section:', err);
            next(err); // Pass the error to the centralized error handler
        }
    }
);


// Route to roster student users to a section
router.post('/sections/:sectionId/roster-students',
    rosterStudentsValidationRules(),
    validate,
    checkStudentsDuplicateIds,
    checkStudentsExistById,
    checkStudentsUserType,
    checkStudentsArchivedById,
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
    rosterStudentsValidationRules(),
    validate,
    checkStudentsDuplicateIds,
    checkStudentsExistById,
    checkStudentsUserType,
    checkStudentsArchivedById,
    checkStudentsRosteredInSection,
    checkSectionExistsById,
    checkSectionActive(),
    async (req, res, next) => {
        const { section } = req;

        try {
            await handleTransaction(async (transaction) => {
                // Use the helper function to unroster the students
                const unrosteredStudents = await removeRosterEntries(req.existingStudents, section.id, transaction);
                res.json({ unrosteredStudents, message: `${unrosteredStudents.length} student(s) removed from the roster` });
            });
        } catch (err) {
            console.error('Error unrostring students:', err);
            next(err);
        }
    }
);

// Roster students from CSV
router.post('/sections/:sectionId/roster-students-by-csv',
    checkSectionExistsById,
    checkSectionActive(),
    upload.single('file'),
    async (req, res, next) => {
        try {
            const buffer = req.file.buffer;
            const content = buffer.toString();
            const { sectionId } = req.params;
            
            // Process the CSV content and validate each row
            const newStudents = await processCsv(content, rosterSectionRowHandler);

            // Database checks for the CSV data
            await checkCsvForDuplicateEmails(newStudents);
            const existingStudents = await checkCsvUsersExistEmail(newStudents);

            // If existingStudents is null, return an error
            const nonExistentEmails = [];
            for (const [email, userDetails] of Object.entries(existingStudents)) {
                if (!userDetails) {
                    nonExistentEmails.push(email);
                }
            }

            if (nonExistentEmails.length > 0) {
                const err = new Error(`Students with the following emails do not exist: ${nonExistentEmails.join(', ')}`);
                err.status = 400;
                return next(err);
            }

            checkCsvUsersAreStudents(existingStudents);
            checkCsvUsersArchived(existingStudents);
            await checkCsvStudentsRostered(existingStudents);

            // Attach the student IDs to the student objects
            newStudents.forEach(student => {
                student.id = existingStudents[student.email]; // Attach the student ID to the student object
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
    checkStudentsArchivedById,// Check if students are active and not archived
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
