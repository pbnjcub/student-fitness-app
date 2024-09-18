const checkStudentsActiveById = (req, res, next) => {
    const ArchivedStudents = [];

    // Use the existing student data from req.existingStudents
    req.existingStudents.forEach(student => {
        if (student.isArchived) {
            ArchivedStudents.push(student.id);
        }
    });

    // If there are inactive/archived students, return a 400 error and stop further processing
    if (ArchivedStudents.length > 0) {
        return res.status(400).json({ 
            error: 'Some students are inactive or archived', 
            studentIds: ArchivedStudents 
        });
    }

    // If no students are archived, proceed to the next middleware
    next();
};

module.exports = checkStudentsActiveById;
