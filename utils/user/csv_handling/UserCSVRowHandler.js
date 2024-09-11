const {
    isEmailValid,
    isPasswordValid,
    isFirstOrLastNameValid,
    isBirthDateValid,
    isUserTypeValid,
    isGenderIdentityValid,
    isPronounsValid,
    isPhotoUrlValid,
    isIsArchivedValid
} = require('../../csv_handling/CsvRowDataValidations');


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
    let errs = [];

    // Email validation and normalization
    if (rowData.email) {
        rowData.email = rowData.email.toLowerCase();
    }
    const emailError = isEmailValid(rowData.email);
    if (emailError !== true) {
        errs.push({ row: rowNumber, field: 'email', message: emailError });
    };

    // Password validation
    const passwordError = isPasswordValid(rowData.password);
    if (passwordError !== true) {
        errs.push({ row: rowNumber, field: 'password', message: passwordError });
    }

    // First and Last name validation
    const firstNameError = isFirstOrLastNameValid(rowData.firstName);
    if (firstNameError !== true) {
        errs.push({ row: rowNumber, field: 'firstName', message: firstNameError });
    }
    const lastNameError = isFirstOrLastNameValid(rowData.lastName);
    if (lastNameError !== true) {
        errs.push({ row: rowNumber, field: 'lastName', message: lastNameError });
    }

    // Birth date validation
    const birthDateError = isBirthDateValid(rowData.birthDate);
    if (birthDateError !== true) {
        errs.push({ row: rowNumber, field: 'birthDate', message: birthDateError });
    }

    // UserType validation
    const userTypeError = isUserTypeValid(rowData.userType);
    if (userTypeError !== true) {
        errs.push({ row: rowNumber, field: 'userType', message: userTypeError });
    } else {
        switch (rowData.userType) {
            case 'student':
                // Validate student-specific fields
                if (!rowData.gradYear || !isFourDigitYear(rowData.gradYear)) {
                    errs.push({ row: rowNumber, field: 'gradYear', message: 'Graduation year is required and must be in YYYY format.' });
                } else {
                    const currentYear = new Date().getFullYear();
                    if (rowData.gradYear > currentYear + 20) {
                        errs.push({ row: rowNumber, field: 'gradYear', message: 'Graduation year must be a reasonable future year.'});
                    }
                }
                break;
            case 'teacher':
            case 'admin':
                // Validate years of experience
                if (rowData.yearsExp === undefined || rowData.yearsExp === null || isNaN(parseInt(rowData.yearsExp))) {
                    errs.push({ row: rowNumber, field: 'yearsExp', message: 'Years of experience is required and must be a number.' });
                } else {
                    const yearsExp = parseInt(rowData.yearsExp);
                    if (yearsExp < 0 || yearsExp > 50) {
                        errs.push({ row: rowNumber, field: 'yearsExp', message: 'Years of experience must be between 0 and 50.' });
                    }
                }
            
                // Validate bio (if you decide it's necessary)
                if (rowData.bio && (typeof rowData.bio !== 'string' || rowData.bio.length > 500)) {
                    errs.push({ row: rowNumber, field: 'bio', message: 'Bio must be a string and less than 500 characters.' });
                }
                break;
            }
    }



    //gender identity validation
    const genderIdentityError = isGenderIdentityValid(rowData.genderIdentity);
    if (genderIdentityError !== true) {
        errs.push({ row: rowNumber, field: 'genderIdentity', message: genderIdentityError });
    }

    //pronouns validation
    const pronounsError = isPronounsValid(rowData.pronouns);
    if (pronounsError !== true) {
        errs.push({ row: rowNumber, field: 'pronouns', message: pronounsError });
    }

    //photoUrl validation
    const photoUrlError = isPhotoUrlValid(rowData.photoUrl);
    if (photoUrlError !== true) {
        errs.push({ row: rowNumber, field: 'photoUrl', message: photoUrlError });
    }

    //isArchived validation
    const isArchivedError = isIsArchivedValid(rowData.isArchived);
    if (isArchivedError !== true) {
        errs.push({ row: rowNumber, field: 'isArchived', message: isArchivedError });
    }

    // Return the result
    if (errs.length > 0) {
        return { error: errs };
    } else {
        // Process and return the data using processUserData
        processedDataWithDetails = processUserData(rowData);

        return { data: processedDataWithDetails };
    }
}

module.exports = userRowHandler;
