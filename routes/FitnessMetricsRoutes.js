const express = require('express');
const router = express.Router();

// Import models
const { StudentDetail, StudentAnthro, FitnessMetric } = require('../models');

// Import helper functions
const { recordAnthroData, updateAnthroData, logPerformanceMetrics, getFitnessHistory, getStudentMetrics } = require('../utils/fitness_metrics/helper_functions/FitnessMetricsHelpers');
const AnthroDto = require('../utils/fitness_metrics/dto/AnthroDto');
const { handleTransaction } = require('../utils/HandleTransaction');


// Import validation middleware
const validate = require('../utils/validation/ValidationMiddleware');
const checkStudentExists = require('../utils/fitness_metrics/middleware_validation/CheckStudentExists');
const checkStudentArchived = require('../utils/fitness_metrics/middleware_validation/CheckStudentArchived');
const checkTeacherExists = require('../utils/fitness_metrics/middleware_validation/CheckTeacherExists');
const checkTeacherArchived = require('../utils/fitness_metrics/middleware_validation/CheckTeacherArchived');
const checkAnthroExists = require('../utils/fitness_metrics/middleware_validation/CheckAnthroExists');
const { createAnthroValidationRules, updateAnthroValidationRules } = require('../utils/fitness_metrics/middleware_validation/AnthroReqObjValidation');
// const { check } = require('express-validator');

// Route to record anthropometric data (e.g., weight, height)
router.post('/users/:id/record-anthro',
    createAnthroValidationRules(), // Validate the incoming anthropometric data
    validate,
    checkStudentExists, // Ensure the student exists before proceeding
    checkStudentArchived, // Ensure the student is not archived before proceeding
    checkTeacherExists({ required: true }), // Ensure the teacher exists before proceeding
    checkTeacherArchived, // Ensure the teacher is not archived before proceeding
    async (req, res, next) => {
        console.log('POST /users/:id/record-anthro');
        try {
            const { id } = req.params;
            const anthroData = req.body;

            await handleTransaction(async (transaction) => {
                // Record the anthropometric data within a transaction
                const recordedAnthro = await recordAnthroData(id, anthroData, transaction);
                const anthroDto = new AnthroDto(recordedAnthro.toJSON());
                res.status(201).json(anthroDto);
            });
        } catch (err) {
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
