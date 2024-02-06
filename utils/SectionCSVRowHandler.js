const {
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
} = require('./CSVValidationHelpers');


function isFourDigitYear(year) {
    return /^\d{4}$/.test(year);
}

function processUserData(rowData) {
    let processedData = {
        email: rowData.email,
        password: rowData.password,
        lastName: rowData.lastName,
        firstName: rowData.firstName,
        birthDate: rowData.birthDate,
        genderIdentity: rowData.genderIdentity,
        pronouns: rowData.pronouns,
        userType: rowData.userType,
        photoUrl: rowData.photoUrl,
        isArchived: rowData.isArchived || false,
        dateArchived: rowData.dateArchived || null
    };

    switch (rowData.userType) {
        case 'student':
            processedData.studentDetails = {
                gradYear: rowData.gradYear || null
            };
            break;
        case 'teacher':
            processedData.teacherDetails = {
                yearsExp: rowData.yearsExp || null,
                bio: rowData.bio || null
            };
            break;
        case 'admin':
            processedData.adminDetails = {
                yearsExp: rowData.yearsExp || null,
                bio: rowData.bio || null
            };
            break;
        default:
            throw new Error("Invalid user type");
    }

    return processedData;
}

function userRowHandler(rowData, rowNumber) {
    let errors = [];

    // Section code validation
    const sectionCodeError = isSectionCodeValid(rowData.sectionCode);
    if (sectionCodeError !== true) {
        errors.push({ row: rowNumber, field: 'sectionCode', message: sectionCodeError });
    }

    // Grade level validation
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
        // Process and return the data using processUserData
        processedDataWithDetails = processUserData(rowData);

        return { data: processedDataWithDetails };
    }
}

module.exports = sectionRowHandler;
