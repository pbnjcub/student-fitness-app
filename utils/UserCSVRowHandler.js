const {
    isValidEmail,
    isPasswordValid,
    isFirstOrLastNameValid,
    isBirthDateValid,
    isUserTypeValid,
    isGenderIdentityValid,
    isPronounsValid,
    isPhotoUrlValid,
    isIsArchivedValid
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

    // Email validation and normalization
    if (rowData.email) {
        rowData.email = rowData.email.toLowerCase();
    }
    const emailError = isValidEmail(rowData.email);
    if (emailError !== true) {
        errors.push({ row: rowNumber, field: 'email', message: emailError });
    };

    // Password validation
    const passwordError = isPasswordValid(rowData.password);
    if (passwordError !== true) {
        errors.push({ row: rowNumber, field: 'password', message: passwordError });
    }

    // First and Last name validation
    const firstNameError = isFirstOrLastNameValid(rowData.firstName);
    if (firstNameError !== true) {
        errors.push({ row: rowNumber, field: 'firstName', message: firstNameError });
    }
    const lastNameError = isFirstOrLastNameValid(rowData.lastName);
    if (lastNameError !== true) {
        errors.push({ row: rowNumber, field: 'lastName', message: lastNameError });
    }

    // Birth date validation
    const birthDateError = isBirthDateValid(rowData.birthDate);
    if (birthDateError !== true) {
        errors.push({ row: rowNumber, field: 'birthDate', message: birthDateError });
    }

    // UserType validation
    const userTypeError = isUserTypeValid(rowData.userType);
    if (userTypeError !== true) {
        errors.push({ row: rowNumber, field: 'userType', message: userTypeError });
    } else {
        switch (rowData.userType) {
            case 'student':
                // Validate student-specific fields
                if (!rowData.gradYear || !isFourDigitYear(rowData.gradYear)) {
                    errors.push({ row: rowNumber, field: 'gradYear', message: 'Graduation year is required and must be in YYYY format.' });
                } else {
                    const currentYear = new Date().getFullYear();
                    if (rowData.gradYear > currentYear + 20) {
                        errors.push({ row: rowNumber, field: 'gradYear', message: 'Graduation year must be a reasonable future year.'});
                    }
                }
                break;
            case 'teacher':
            case 'admin':
                // Validate years of experience
                if (rowData.yearsExp === undefined || rowData.yearsExp === null || isNaN(parseInt(rowData.yearsExp))) {
                    errors.push({ row: rowNumber, field: 'yearsExp', message: 'Years of experience is required and must be a number.' });
                } else {
                    const yearsExp = parseInt(rowData.yearsExp);
                    if (yearsExp < 0 || yearsExp > 50) {
                        errors.push({ row: rowNumber, field: 'yearsExp', message: 'Years of experience must be between 0 and 50.' });
                    }
                }
            
                // Validate bio (if you decide it's necessary)
                if (rowData.bio && (typeof rowData.bio !== 'string' || rowData.bio.length > 500)) {
                    errors.push({ row: rowNumber, field: 'bio', message: 'Bio must be a string and less than 500 characters.' });
                }
                break;
            }
    }



    //gender identity validation
    const genderIdentityError = isGenderIdentityValid(rowData.genderIdentity);
    if (genderIdentityError !== true) {
        errors.push({ row: rowNumber, field: 'genderIdentity', message: genderIdentityError });
    }

    //pronouns validation
    const pronounsError = isPronounsValid(rowData.pronouns);
    if (pronounsError !== true) {
        errors.push({ row: rowNumber, field: 'pronouns', message: pronounsError });
    }

    //photoUrl validation
    const photoUrlError = isPhotoUrlValid(rowData.photoUrl);
    if (photoUrlError !== true) {
        errors.push({ row: rowNumber, field: 'photoUrl', message: photoUrlError });
    }

    //isArchived validation
    const isArchivedError = isIsArchivedValid(rowData.isArchived);
    if (isArchivedError !== true) {
        errors.push({ row: rowNumber, field: 'isArchived', message: isArchivedError });
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

module.exports = userRowHandler;
