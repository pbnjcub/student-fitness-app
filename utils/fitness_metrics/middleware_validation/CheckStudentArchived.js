function checkStudentArchived(req, res, next) {
    if (req.student.isArchived) {
        const err = new Error(`Student with ID ${req.student.id} is archived and cannot perform this operation.`);
        err.status = 403; // Forbidden access
        return next(err);
    }
    next();
}

module.exports = checkStudentArchived;
