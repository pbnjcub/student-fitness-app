const { 
    isEmailValid,    
    isTeacherUserIdValid,
    isHeightValid,
    isWeightValid,
    isDateRecordedValid
} = require('../../csv_handling/CsvRowDataValidations');

function anthroCsvRowHandler(rowData, rowNumber) {
    let errs = [];

    // Email validation
    if (rowData.email) {
        rowData.email = rowData.email.toLowerCase();
    }
    const emailError = isEmailValid(rowData.email);
    if (emailError !== true) {
        errs.push({ row: rowNumber, field: 'email', message: emailError });

    // TeacherUserId validation
    const teacherUserIdError = isTeacherUserIdValid(rowData.teacherUserId);
    if (teacherUserIdError !== true) {
        errs.push({ row: rowNumber, field: 'teacherUserId', message: teacherUserIdError });
    }

    // Height validation
    const heightError = isHeightValid(rowData.height);
    if (heightError !== true) {
        errs.push({ row: rowNumber, field: 'height', message: heightError });
    }

    // Weight validation
    const weightError = isWeightValid(rowData.weight);
    if (weightError !== true) {
        errs.push({ row: rowNumber, field: 'weight', message: weightError });
    }

    // Date recorded validation
    const dateRecordedError = isDateRecordedValid(rowData.dateRecorded);
    if (dateRecordedError !== true) {
        errs.push({ row: rowNumber, field: 'dateRecorded', message: dateRecordedError });
    }

    // Return the result
    if (errs.length > 0) {
        return { errs: errs };
    } else {
        return { data: rowData };
    }
}
}



module.exports = anthroCsvRowHandler;
