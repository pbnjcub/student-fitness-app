const {
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
} = require('./CSVValidationHelpers');



function sectionRowHandler(rowData, rowNumber) {
    let errors = [];

    // Section code validation
    const sectionCodeError = isSectionCodeValid(rowData.sectionCode);
    if (sectionCodeError !== true) {
        errors.push({ row: rowNumber, field: 'sectionCode', message: sectionCodeError });
    }

    // Grade level validation
    console.log(' type of gradeLevel:', typeof rowData.gradeLevel, ' gradeLevel:', rowData.gradeLevel)
    const gradeLevelError = isSectionGradeLevelValid(rowData.gradeLevel);
    if (gradeLevelError !== true) {
        errors.push({ row: rowNumber, field: 'gradeLevel', message: gradeLevelError });
    }

    // UserType validation
    const isActiveError = isSectionActiveValid(rowData.isActive);
    if (isActiveError !== true) {
        errors.push({ row: rowNumber, field: 'isActive', message: isActiveError });
    } 
    // Return the result
    if (errors.length > 0) {
        return { error: errors };
    } else {
        return { data: rowData };
    }
}

module.exports = sectionRowHandler;
