const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { sequelize } = require('../models');
const { User, Section, SectionRoster, StudentDetail } = require('../models');


//import helper functions
const { SectionDTO, SectionByIdDTO } = require('../utils/section/section_dto/SectionDTO');
const { createSection, findSectionById, sectionExists, getAcademicYear, getGradeLevel, hasEnrolledStudents, checkSectionExists, checkSectionIsActive } = require('../utils/section/SectionHelpers');
const processCsv = require('../utils/csv_handling/GenCSVHandler');
const sectionRowHandler = require('../utils/section/csv_handling/SectionCSVRowHandler');

//import validation middleware
const { sectionValidationRules, updateSectionValidationRules } = require('../utils/validation/ValidationRules');
const validate = require('../utils/validation/ValidationMiddleware');
const { validateRoster, validateUnroster } = require('../utils/validation/SectionRosterValidation');

//add section
router.post('/sections', sectionValidationRules(), validate, async (req, res, next) => {
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

//retrieve only active sections
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

router.get('/sections/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const section = await findSectionById(id);

        const sectionWithRoster = new SectionByIdDTO(section);

        res.json(sectionWithRoster);
    } catch (err) {
        next(err);
    }
});

//bulk upload from csv
router.post('/sections/upload-csv', upload.single('file'), async (req, res, next) => {

    let transaction;

    try {
        const buffer = req.file.buffer;
        const content = buffer.toString();

        const newSections = await processCsv(content, sectionRowHandler);
        
        transaction = await sequelize.transaction();
 
        for (const section of newSections) {
            await createSection(section, transaction);
        }

        await transaction.commit();
        const sections = await Section.findAll();

        const sectionsDTO = sections.map(section => new SectionDTO(section.toJSON()));

        res.status(201).json(sectionsDTO);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error in POST /sections/upload-csv', err);
        next(err);
    }
});
 
//edit section by id
router.patch('/sections/:id', updateSectionValidationRules(), validate, async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const section = await checkSectionExists(req, res, id);
        if (!section) return; 

        // Check if the section is currently active
        if (section.isActive) {
            // If isActive is being updated, check for enrolled students
            if (typeof isActive === 'boolean' && section.isActive !== isActive) {
                const hasStudents = await hasEnrolledStudents(id);

                if (hasStudents) {
                    console.log(`Section with ID ${id} has enrolled students and cannot change isActive status.`);
                    return res.status(400).json({ error: 'Section has enrolled students and cannot change isActive status.' });
                }
            }
        }

        await section.update(req.body);

        const updatedSection = await Section.findByPk(id);
        const sectionDTO = new SectionDTO(updatedSection);

        res.status(200).json(sectionDTO);
    } catch (err) {
        console.error('Error updating section:', err);
        next(err);
    }
});


//delete section
router.delete('/sections/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const section = await checkSectionExists(req, res, id);
        if (!section) return; 

        // Check for enrolled students using the helper function
        const hasStudents = await hasEnrolledStudents(id);

        if (hasStudents) {
            console.log(`Section with ID ${id} has enrolled students and cannot be deleted.`);
            return res.status(400).json({ error: 'Section has enrolled students and cannot be deleted.' });
        }

        await section.destroy();

        res.status(200).json({ message: `Section with ID ${id} successfully deleted` });
    } catch (err) {
        console.error('Error deleting section:', err);
        next(err);
    }
});

// route to roster a student user to a section
router.post('/sections/:sectionId/roster-students', validateRoster, async (req, res, next) => {
    const { id } = req.params;

    try {
        const section = await checkSectionExists(req, res, id);
        if (!section) return; 

        const isActive = await checkSectionIsActive(req, res, section);
        if (!isActive) return; // Exit if the section is inactive

        const transaction = await sequelize.transaction();

        const rosteredStudents = [];
        for (const student of req.validatedStudents) {
            const sectionRoster = await SectionRoster.create({
                studentUserId: student.id,
                sectionId: sectionId,
            }, { transaction });

            rosteredStudents.push(sectionRoster);
        }

        await transaction.commit();
        res.json({ rosteredStudents, message: `${rosteredStudents.length} student(s) added to the roster` });
    } catch (err) {
        console.error('Error rostering students:', err);
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
                return next(rollbackError);
            }
        }
        next(err);  // Pass the error to the error-handling middleware
    }
});


//route to unenroll student from section
router.delete('/sections/:sectionId/unroster-students', validateUnroster, async (req, res, next) => {
    const { sectionId } = req.params;

    try {
        const transaction = await sequelize.transaction();

        const section = await Section.findByPk(sectionId, { transaction });
        if (!section) {
            console.log(`Section with ID ${sectionId} not found.`);
            return res.status(404).json({ error: 'Section not found' });
        }

        const unrosteredStudents = [];
        for (const student of req.validatedStudents) {
            const sectionRoster = await SectionRoster.findOne({
                where: {
                    studentUserId: student.id,
                    sectionId: sectionId
                },
                transaction
            });

            if (sectionRoster) {
                await sectionRoster.destroy({ transaction });
                unrosteredStudents.push(sectionRoster);
            }
        }

        await transaction.commit();
        res.json({ unrosteredStudents, message: `${unrosteredStudents.length} student(s) removed from the roster` });
    } catch (err) {
        console.error('Error unrostering students:', err);
        await transaction.rollback();
        next(err);
    }
});




//roster students from csv
router.post('/sections/:sectionId/add-students/upload', upload.single('file'), async (req, res) => {
    console.log(`Starting POST /sections/roster-students/upload...`);

    try {
        const transaction = await sequelize.transaction();

        const buffer = req.file.buffer;
        const content = buffer.toString();

        const processedIds = new Set();
        const rosteredStudents = [];
        const notExistingStudents = [];
        const alreadyRosteredStudents = [];
        const duplicateIds = [];
        const incorrectGradeLevel = [];
        const notExistingSections = [];
        const missingEmailSectionCode = [];

        Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            complete: async (results) => {
                try {
                    for (const rosterData of results.data) {
                        const { email, sectionCode } = rosterData;

                        if (!email || !sectionCode) {
                            missingEmailSectionCode.push(rosterData);
                            continue; // Skip to the next iteration
                        }

                        if (processedIds.has(email)) {
                            duplicateIds.push(rosterData);
                            continue; // Skip to the next iteration
                        }

                        processedIds.add(email);

                        const student = await User.findOne({
                            where: { email: email },
                            include: [{ model: StudentDetail, as: 'studentDetails' }],
                            transaction
                        });

                        if (!student || student.userType !== 'student') {
                            console.log(`Student with email ${email} not found or not a student.`);
                            notExistingStudents.push(rosterData);
                            continue; // Skip to the next iteration
                        }

                        const studentGradeLevel = getGradeLevel(student);
                        if (typeof studentGradeLevel !== 'number' || studentGradeLevel.toString() !== section.gradeLevel) {
                            console.log(`Student's grade level does not match the section's grade level.`);
                            incorrectGradeLevel.push(rosterData);
                            continue; // Skip to the next iteration
                        }

                        console.log(`Found student:`, student.toJSON());

                        const section = await Section.findOne({
                            where: { sectionCode },
                            transaction
                        });
                        if (!section) {
                        console.log(`Section with code ${sectionCode} not found.`);
                        notExistingSections.push(rosterData);
                        continue; // Skip to the next iteration
                        }

                        console.log(`Found section:`, section.toJSON());

                        const existingRoster = await SectionRoster.findOne({
                            where: { studentUserId: student.id },
                            transaction
                        });
                        if (existingRoster) {
                            console.log(`Student with email ${email} is already rostered in another section.`);
                            alreadyRosteredStudents.push(rosterData);
                            continue; // Skip to the next student
                        }

                        const sectionRoster = await SectionRoster.create({
                            studentUserId: student.id,
                            sectionId: section.id
                        }, { transaction });

                        rosteredStudents.push(sectionRoster);
                    }

                    if (
                        alreadyRosteredStudents.length > 0 ||
                        notExistingStudents.length > 0 ||
                        incorrectGradeLevel.length > 0 ||
                        notExistingSections.length > 0 ||
                        missingEmailSectionCode.length > 0
                        ) {
                            await transaction.rollback();
                            return res.status(400).json({
                            error: 'Some students could not be rostered',
                            alreadyRosteredStudents: alreadyRosteredStudents,
                            notExistingStudents: notExistingStudents,
                            incorrectGradeLevel: incorrectGradeLevel,
                            notExistingSections: notExistingSections,
                            missingEmailSectionCode: missingEmailSectionCode
                        });
                    }

                    await transaction.commit();
                    res.status(201).json({ success: 'File uploaded and processed successfully', newRosterEntries });
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




//unroster student or students from section
router.delete('/sections/:sectionId/unroster-student', async (req, res) => {
    const { sectionId } = req.params;
    let { studentUserIds } = req.body;

    if (!sectionId) return res.status(400).json({ error: 'Section ID is required' });

    // Ensure studentUserIds is an array even if only one id is provided
    if (!Array.isArray(studentUserIds)) {
        studentUserIds = [studentUserIds];
    }

    if (studentUserIds.length === 0) return res.status(400).json({ error: 'At least one Student User ID is required' });

    try {
        const transaction = await sequelize.transaction();

        const section = await Section.findByPk(sectionId, { transaction });
        if (!section) {
            await transaction.rollback();
            console.log(`Section with ID ${sectionId} not found.`);
            return res.status(404).json({ error: 'Section not found' });
        }
        console.log(`Found section:`, section.toJSON());

        const unrosteredStudents = [];
        for (const studentUserId of studentUserIds) {
            const student = await User.findByPk(studentUserId, { transaction });
            if (!student || student.userType !== 'student') {
                console.log(`Student with ID ${studentUserId} not found or not a student.`);
                continue; // Skip to the next student
            }
            console.log(`Found student:`, student.toJSON());

            const sectionRoster = await SectionRoster.findOne({
                where: {
                    studentUserId: studentUserId,
                    sectionId: sectionId
                },
                transaction
            });

            if (!sectionRoster) {
                console.log(`Student with ID ${studentUserId} is not rostered to section with ID ${sectionId}.`);
                continue; // Skip to the next student
            }

            await sectionRoster.destroy({ transaction });

            unrosteredStudents.push(sectionRoster);
        }

        await transaction.commit();
        res.json({ unrosteredStudents, message: `${unrosteredStudents.length} student(s) removed from the roster` });
    } catch (error) {
        console.error('Error unrostering students:', error);
        res.status(500).send('Server error');
    }
});


module.exports = router;