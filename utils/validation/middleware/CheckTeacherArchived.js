function checkTeacherArchived(req, res, next) {
    if (req.teacher && req.teacher.isArchived) {
        const err = new Error(`Teacher with ID ${req.teacher.id} is archived and cannot perform this operation.`);
        err.status = 403; // Forbidden access
        return next(err);
    }
    next();
}

module.exports = checkTeacherArchived;
