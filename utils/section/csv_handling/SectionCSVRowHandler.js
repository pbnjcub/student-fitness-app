const {
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
} = require('../../csv_handling/CSVValidationHelpers');

const gradeLevelEnumMapping = {
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    '10-11-12': '10-11-12'
};

function convertGradeLevelToEnum(gradeLevel) {
    // Convert numeric gradeLevel to string if it's not already a string
    const gradeLevelStr = gradeLevel.toString();

    // Use the mapping to find the corresponding enum label
    const enumLabel = gradeLevelEnumMapping[gradeLevelStr];

    if (!enumLabel) {
        throw new Error(`Invalid grade level: ${gradeLevel}`);
    }

    return enumLabel;
}


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
