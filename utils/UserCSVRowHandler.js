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

function userRowHandler(rowData) {
    let errors = [];

    // Email validation and normalization
    if (rowData.email) {
        rowData.email = rowData.email.toLowerCase();
    }
    const emailError = isValidEmail(rowData.email);
    if (emailError !== true) {
        errors.push({ field: 'email', message: emailError });
    };

    // Password validation
    const passwordError = isPasswordValid(rowData.password);
    if (passwordError !== true) {
        errors.push({ field: 'password', message: passwordError });
    }

    // First and Last name validation
    const firstNameError = isFirstOrLastNameValid(rowData.firstName);
    if (firstNameError !== true) {
        errors.push({ field: 'firstName', message: firstNameError });
    }
    const lastNameError = isFirstOrLastNameValid(rowData.lastName);
    if (lastNameError !== true) {
        errors.push({ field: 'lastName', message: lastNameError });
    }

    // Birth date validation
    const birthDateError = isBirthDateValid(rowData.birthDate);
    if (birthDateError !== true) {
        errors.push({ field: 'birthDate', message: birthDateError });
    }

    // UserType validation
    const userTypeError = isUserTypeValid(rowData.userType);
    if (userTypeError !== true) {
        errors.push({ field: 'userType', message: userTypeError });
    } else {
        switch (rowData.userType) {
            case 'student':
                // Validate student-specific fields
                if (!rowData.gradYear || !isFourDigitYear(rowData.gradYear)) {
                    errors.push({ field: 'gradYear', message: 'Graduation year (YYYY) is required for students' });
                } else
                break;
            case 'teacher':
            case 'admin':
                // Validate teacher/admin-specific fields
                if ( rowData.yearsExp && isNaN(parseInt(rowData.yearsExp))) {
                    errors.push({ field: 'yearsExp', message: 'Years of experience must be a number' });                }
                break;
        }
    }

    //gender identity validation
    const genderIdentityError = isGenderIdentityValid(rowData.genderIdentity);
    if (genderIdentityError !== true) {
        errors.push({ field: 'genderIdentity', message: genderIdentityError });
    }

    //pronouns validation
    const pronounsError = isPronounsValid(rowData.pronouns);
    if (pronounsError !== true) {
        errors.push({ field: 'pronouns', message: pronounsError });
    }

    //photoUrl validation
    const photoUrlError = isPhotoUrlValid(rowData.photoUrl);
    if (photoUrlError !== true) {
        errors.push({ field: 'photoUrl', message: photoUrlError });
    }

    //isArchived validation
    const isArchivedError = isIsArchivedValid(rowData.isArchived);
    if (isArchivedError !== true) {
        errors.push({ field: 'isArchived', message: isArchivedError });
    }

    //userType validation
    if (!['student', 'teacher', 'admin'].includes(rowData.userType)) {
        errors.push({ field: 'userType', message: 'User type must be one of the following: student, teacher, admin' });
    } else {
        switch (rowData.userType) {
            case 'student':
                // Validate student-specific fields
                if (!rowData.gradYear || !isFourDigitYear(rowData.gradYear)) {
                    errors.push({ field: 'gradYear', message: 'Graduation year (YYYY) is required for students' });
                } else
                break;
            case 'teacher':
            case 'admin':
                // Validate teacher/admin-specific fields
                if ( rowData.yearsExp && isNaN(parseInt(rowData.yearsExp))) {
                    errors.push({ field: 'yearsExp', message: 'Years of experience must be a number' });                }
                break;
        }
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
