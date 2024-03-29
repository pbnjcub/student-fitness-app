const isValidEmail = (email) => {
    if (email === null || email === undefined || email === '') {
        return 'Email is required';
    }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const isPasswordValid = (password) => {
    if (password === null || password === undefined || password === '') {
        return 'Password is required';
    }
    return password.length >= 4 && password.length <= 128;
};


const isFirstOrLastNameValid = (name) => {
    if (name === null || name === undefined || name === '') {
        return 'First and last name are required';
    }
  return name.length >= 2;
}

const isBirthDateValid = (date) => {
    if (date === undefined || date === null || date === '') {
        return 'Birth date is required';
    }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
}

const isGenderIdentityValid = (genderIdentity) => {
    if (genderIdentity === undefined || genderIdentity === null || genderIdentity === '') {
        return true; // Field is optional, so absence is fine
    }

    if (typeof genderIdentity !== 'string') {
        return 'Gender Identity must be a string'; // Return error message
    }

    return true; // No error if it's a string
};

const isPronounsValid = (pronouns) => {
    if (pronouns === undefined || pronouns === null || pronouns === '') {
        return true; // Field is optional, so absence is fine
    }

    if (typeof pronouns !== 'string') {
        return 'Pronouns must be a string'; // Return error message
    }

    return true; // No error if it's a string
};

const isUserTypeValid = (userType) => {
    if (userType === undefined || userType === null || userType === '') {
        return 'User type is required'; // Field is required, so absence is an error
    }

    if (typeof userType !== 'string') {
        return 'User type must be a string'; // Return error message
    }

    if (!['student', 'teacher', 'admin'].includes(userType)) {
        return 'User type must be one of the following: student, teacher, admin'; // Return error message
    }

    return true; // No error if it's a string
};

const isPhotoUrlValid = (photoUrl) => {
    if (photoUrl === undefined || photoUrl === null || photoUrl === '') {
        return true; // Field is optional, so absence is fine
    }

    if (typeof photoUrl !== 'string') {
        return 'Photo URL must be a string'; // Return error message
    }

    return true; // No error if it's a string
};

const isIsArchivedValid = (isArchived) => {
    if (isArchived === undefined || isArchived === null || isArchived === '') {
        return true; // Field is optional, so absence is fine
    }

    if (typeof isArchived !== 'boolean') {
        return 'isArchived must be a boolean'; // Return error message
    }

    return true; // No error if it's a boolean
};

//section validations
const isSectionCodeValid = (sectionCode) => {
    let sectionCodeStr = String(sectionCode).trim();
    if (sectionCodeStr === undefined || sectionCodeStr === null || sectionCodeStr === '') {
        return 'Section code is required'; // Field is required, so absence is an error
    }

    console.log(`Checking length for sectionCode: ${sectionCode}`)
    if (sectionCodeStr.length != 7) {
        return 'Section code must be in the following format: "nnnn-nn" where n is a number';
    }
    

    return true; // No error if it's a string
};

const isSectionGradeLevelValid = (gradeLevel) => {
    console.log('Checking type for gradeLevel:', typeof gradeLevel, ' gradeLevel:', gradeLevel)
    let sectionGradeLevelStr = String(gradeLevel).trim();
    if (sectionGradeLevelStr === undefined || sectionGradeLevelStr === null || sectionGradeLevelStr === '') {
        return 'Grade level is required'; // Field is required, so absence is an error
    }

    if (!['6', '7', '8', '9', '10-11-12'].includes(sectionGradeLevelStr)) {
        return 'Grade level must be either "6", "7", "8", "9", or "10-11-12"';
    }
    

    return true; // No error if it's a string
};

const isSectionActiveValid = (isActive) => {
    if (isActive === undefined || isActive === null || isActive === '') {
        return 'isActive is required'; // Field is required, so absence is an error
    }

    if (typeof isActive !== 'boolean') {
        return 'isActive must be a boolean'; // Return error message
    }

    return true; // No error if it's a boolean
}


module.exports = {
    isValidEmail,
    isPasswordValid,
    isFirstOrLastNameValid,
    isBirthDateValid,
    isGenderIdentityValid,
    isPronounsValid,
    isUserTypeValid,
    isPhotoUrlValid,
    isIsArchivedValid,
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
}