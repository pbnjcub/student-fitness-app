const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const isPasswordValid = (password) => {
  return password.length >= 4 && password.length <= 128;
}

const isFirstOrLastNameValid = (name) => {
  return name.length >= 2;
}

const isBirthDateValid = (date) => {
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


module.exports = {
    isValidEmail,
    isPasswordValid,
    isFirstOrLastNameValid,
    isBirthDateValid,
    isGenderIdentityValid,
    isPronounsValid,
    isUserTypeValid,
    isPhotoUrlValid,
    isIsArchivedValid
}