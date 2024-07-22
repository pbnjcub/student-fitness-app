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
    let err = [];

    // Section code validation
    console.log(`Validating sectionCode: '${rowData.sectionCode}', Type: ${typeof rowData.sectionCode}`);

    const sectionCodeError = isSectionCodeValid(rowData.sectionCode);
    console.log('sectionCodeError:', sectionCodeError)
    if (sectionCodeError !== true) {
        console.log('sectionCodeError:', sectionCodeError)
        err.push({ row: rowNumber, field: 'sectionCode', message: sectionCodeError });
    }

    // Grade level validation
    console.log(' type of gradeLevel:', typeof rowData.gradeLevel, ' gradeLevel:', rowData.gradeLevel)
    const gradeLevelError = isSectionGradeLevelValid(rowData.gradeLevel);
    if (gradeLevelError !== true) {
        err.push({ row: rowNumber, field: 'gradeLevel', message: gradeLevelError });
    }

    // UserType validation
    const isActiveError = isSectionActiveValid(rowData.isActive);
    if (isActiveError !== true) {
        err.push({ row: rowNumber, field: 'isActive', message: isActiveError });
    } 
    // Return the result
    if (err.length > 0) {
        return { errors: err };
    } else {
        return { data: rowData };
    }
}

module.exports = sectionRowHandler;
