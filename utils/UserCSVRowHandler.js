
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    if (!rowData.email || !isValidEmail(rowData.email)) {
        errors.push({ field: 'email', message: 'Invalid or missing email' });
    }

    // Password validation
    if (!rowData.password || rowData.password.length < 6 || rowData.password.length > 128) {
        errors.push({ field: 'password', message: 'Password must exist or must be between 6 and 128 characters' });
    }

    // First name validation

    if (!rowData.firstName) {
        errors.push({ field: 'firstName', message: 'First name is required' });
    }

    // Last name validation
    if (!rowData.lastName) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    // Birth date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!rowData.birthDate) {
        errors.push({ field: 'birthDate', message: 'Birth date is required' });
    }
    
    if (!dateRegex.test(rowData.birthDate) || isNaN(Date.parse(rowData.birthDate))) {
        errors.push({ field: 'birthDate', message: 'Birth date must be be formatted as YYYY-MM-DD or is not a valid date' });
    };

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
