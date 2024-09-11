const {
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
} = require('../../csv_handling/CsvRowDataValidations');

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
    let errs = [];

    // Section code validation
    console.log(`Validating sectionCode: '${rowData.sectionCode}', Type: ${typeof rowData.sectionCode}`);

    const sectionCodeError = isSectionCodeValid(rowData.sectionCode);
    console.log('sectionCodeError:', sectionCodeError)
    if (sectionCodeError !== true) {
        console.log('sectionCodeError:', sectionCodeError)
        errs.push({ row: rowNumber, field: 'sectionCode', message: sectionCodeError });
    }

    // Grade level validation
    console.log(' type of gradeLevel:', typeof rowData.gradeLevel, ' gradeLevel:', rowData.gradeLevel)
    const gradeLevelError = isSectionGradeLevelValid(rowData.gradeLevel);
    if (gradeLevelError !== true) {
        errs.push({ row: rowNumber, field: 'gradeLevel', message: gradeLevelError });
    }

    // UserType validation
    const isActiveError = isSectionActiveValid(rowData.isActive);
    if (isActiveError !== true) {
        errs.push({ row: rowNumber, field: 'isActive', message: isActiveError });
    } 
    // Return the result
    if (errs.length > 0) {
        return { errs: errs };
    } else {
        return { data: rowData };
    }
}

module.exports = sectionRowHandler;
