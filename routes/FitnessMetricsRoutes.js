const express = require('express');
const router = express.Router();


// Import models
const { sequelize, StudentDetail, StudentAnthro, FitnessMetric, StudentHistAnthro } = require('../models');

// Import helper functions
const { recordAnthroData, updateAnthroData, fetchAnthropometricData, transferAnthroToHist, logPerformanceMetrics, getFitnessHistory, getStudentMetrics } = require('../utils/fitness_metrics/helper_functions/FitnessMetricsHelpers');
const AnthroDto = require('../utils/fitness_metrics/dto/AnthroDto');
const { handleTransaction } = require('../utils/HandleTransaction');
const anthroRowHandler = require('../utils/fitness_metrics/csv_handling/AnthroCSVRowHandler');

// Import validation middleware
const validate = require('../utils/validation/Validate');
const { checkStudentsExistEmail } = require('../utils/csv_handling/CsvExistingDataChecks');
const checkStudentExists = require('../utils/fitness_metrics/middleware_validation/CheckStudentExists');
const checkStudentArchived = require('../utils/fitness_metrics/middleware_validation/CheckStudentArchived');
const checkTeacherExists = require('../utils/fitness_metrics/middleware_validation/CheckTeacherExists');
const checkTeacherArchived = require('../utils/fitness_metrics/middleware_validation/CheckTeacherArchived');
const checkAnthroExists = require('../utils/fitness_metrics/middleware_validation/CheckAnthroExists');
const { createAnthroValidationRules, updateAnthroValidationRules } = require('../utils/fitness_metrics/middleware_validation/AnthroReqObjValidation');

// Route to record anthropometric data (e.g., weight, height). this route should include the following:
router.post('/users/:id/record-anthro',
    createAnthroValidationRules(), // Validate the incoming anthropometric data
    validate,
    checkStudentExists, // Ensure the student exists before proceeding
    checkStudentArchived, // Ensure the student is not archived before proceeding
    checkTeacherExists({ required: true }), // Ensure the teacher exists before proceeding
    checkTeacherArchived, // Ensure the teacher is not archived before proceeding
    async (req, res, next) => {
        console.log('POST /users/:id/record-anthro');
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const anthroData = req.body;

            // Transfer existing anthro data to the historical table
            const existingAnthro = await transferAnthroToHist(id, transaction);

            // Delete the existing anthro data
            if (existingAnthro) {
                StudentAnthro.destroy({
                    where: { id: existingAnthro.id },
                    transaction: transaction
                });
            }

            // Record the new anthropometric data
            const newAnthroRecord = await recordAnthroData(id, anthroData, transaction);
            const anthroDto = new AnthroDto(newAnthroRecord.toJSON());

            await transaction.commit();
            res.status(201).json(anthroDto);

        } catch (err) {
            await transaction.rollback();
            console.error('Error in POST /users/:id/record-anthro:', err);
            next(err);
        }
    }
);

// Edit current anthropometric data
router.patch('/users/:id/update-anthro',
    updateAnthroValidationRules(), // You might want to customize these rules for patching
    validate,
    checkStudentExists,
    checkStudentArchived,
    checkTeacherExists(),
    checkTeacherArchived,
    checkAnthroExists,
    async (req, res, next) => {
        console.log('PATCH /users/:id/update-anthro');
        try {
            const { id } = req.params;
            const anthroData = req.body;
            const existingAnthro = req.existingAnthro;

            await handleTransaction(async (transaction) => {
                // Update the anthropometric data within a transaction
                const updatedAnthro = await updateAnthroData(existingAnthro, anthroData, transaction);
                const anthroDto = new AnthroDto(updatedAnthro.toJSON());
                res.status(200).json(anthroDto);
            });
        } catch (err) {
            console.error('Error in PATCH /users/:id/update-anthro:', err);
            next(err);
        }
    }
);

// Route to retrieve all anthro data related to one student, including historical data
router.get('/users/:id/anthro',
    checkStudentExists,
    checkStudentArchived,
    async (req, res, next) => {
        console.log('GET /users/:id/anthro');
        try {
            const { id } = req.params;
            const anthroData = await fetchAnthropometricData(id);
            res.json(anthroData);
        } catch (err) {
            console.error('Error in GET /users/:id/anthro:', err);
            res.status(500).json({ message: 'Failed to retrieve anthropometric data' });
        }
    }
);

// Bulk upload anthro data for a class of students
router.post('/users/record-anthro-csv',
    upload.single('file'),
    async (req, res, next) => {
        try {
            const buffer = req.file.buffer;
            const content = buffer.toString();
            const anthroData = await processCsv(content, anthroRowHandler);

            // Check for duplicate entries
            await checkCsvForDuplicateEmails(anthroData);

            // Check if students exist by email
            // Check if students are archived
            // Attach studentUserId to each anthro data object retrieved from the processed emails
            // Check if teacher exists by email
            // Check if teacher is archived
            // Attach teacherUserId to each anthro data object retrieved from the processed emails

            // Record anthro data in a transaction
            await handleTransaction(async (transaction) => {
                for (const data of anthroData) {
                    await recordAnthroData(data.email, data, transaction);
                }
            });

            res.status(201).json({ message: 'Anthropometric data recorded successfully' });
        } catch (err) {

            console.error('Error in POST /users/record-anthro-csv:', err);
            next(err);
    
        }
    }
)

// delete historical anthro data from the StudentHistAnthro table
router.delete('/delete-anthro/:id',
    async (req, res, next) => {
        console.log('DELETE /delete-anthro/:id');
        try {
            const { id } = req.params;
            const historicalData = await StudentHistAnthro.findByPk(id);
            if (!historicalData) {
                res.status(404).json({ message: 'Historical anthropometric data not found' });
                return;
            }
            await historicalData.destroy();
            res.status(204).end();
        } catch (err) {
            console.error('Error in DELETE /historical-anthro/:id:', err);
            res.status(500).json({ message: 'Failed to delete historical anthropometric data' });
        }
    }
);

// // Route to log performance metrics (e.g., mile time, bicep curls)
// router.post('/students/:id/metrics',
//     checkUserExists, // Ensure the student exists before proceeding
//     validateMetricData, // Validate the incoming performance metric data
//     async (req, res, next) => {
//         try {
//             const { id } = req.params;
//             const performanceData = req.body;

//             // Log the performance metrics
//             const loggedMetrics = await logPerformanceMetrics(id, performanceData);

//             res.status(201).json(new FitnessMetricDTO(loggedMetrics.toJSON()));
//         } catch (err) {
//             console.error('Error in POST /students/:id/metrics:', err);
//             next(err);
//         }
//     }
// );

// // Route to retrieve fitness history for a student
// router.get('/students/:id/history',
//     checkUserExists, // Ensure the student exists before proceeding
//     async (req, res, next) => {
//         try {
//             const { id } = req.params;

//             // Retrieve the student's fitness history
//             const fitnessHistory = await getFitnessHistory(id);

//             const fitnessHistoryDTOs = fitnessHistory.map(metric => new FitnessMetricDTO(metric.toJSON()));
//             res.json(fitnessHistoryDTOs);
//         } catch (err) {
//             console.error('Error in GET /students/:id/history:', err);
//             next(err);
//         }
//     }
// );

// // Route to retrieve all fitness metrics for a student
// router.get('/students/:id/metrics',
//     checkUserExists, // Ensure the student exists before proceeding
//     async (req, res, next) => {
//         try {
//             const { id } = req.params;

//             // Retrieve all fitness metrics for the student
//             const studentMetrics = await getStudentMetrics(id);

//             const studentMetricsDTOs = studentMetrics.map(metric => new FitnessMetricDTO(metric.toJSON()));
//             res.json(studentMetricsDTOs);
//         } catch (err) {
//             console.error('Error in GET /students/:id/metrics:', err);
//             next(err);
//         }
//     }
// );

module.exports = router;
