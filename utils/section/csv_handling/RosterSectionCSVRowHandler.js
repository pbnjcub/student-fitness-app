// validation imports
const {
    isValidEmail
} = require('../../csv_handling/CSVValidationHelpers');

function rosterSectionRowHandler(rowData, rowNumber) {
    let errs = [];

    // email validation
    console.log(`Validating email: '${rowData.email}', Type: ${typeof rowData.email}`);

    const emailError = isValidEmail(rowData.email);
    console.log('emailError:', emailError)
    if (emailError !== true) {
        console.log('emailError:', emailError)
        errs.push({ row: rowNumber, field: 'email', message: emailError });
    }

    // Return the result
    if (errs.length > 0) {
        return { errs: errs };
    } else {
        return { data: rowData };
    }
}

module.exports = rosterSectionRowHandler;
