// validateGradeLevel.js

function checkGradeLevel(req, res, next) {
    const { grade } = req.query;

    if (!grade) {
        const err = new Error('Grade level is required');
        return next(err);
    }

    // Split grades and trim whitespace
    const validGrades = ['6', '7', '8', '9', '10-11-12'];
    const grades = grade.split(',').map(g => g.trim());

    // Check if all provided grades are valid
    const isValid = grades.every(g => validGrades.includes(g));

    if (!isValid) {
        const err = new Error('Grade level must be either "6", "7", "8", "9", or "10-11-12"');
        return next(err);
    }

    // Attach clean grades to request for further use in the route handler if needed
    req.validatedGrades = grades;
    next();
}

module.exports = checkGradeLevel;
