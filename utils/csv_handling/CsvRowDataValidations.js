const { User, StudentDetail } = require('../../../models'); // Import necessary models

const moment = require('moment');

const isEmailValid = (email) => {
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

const isBirthDateValid = (birthDate) => {
    if (!birthDate) {
        return 'Birth date is required';
    }
    if (!moment(birthDate, 'YYYY-MM-DD', true).isValid()) {
        return 'Birth date must be in the following format (YYYY-MM-DD)';
    }
    return true;
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
        return 'isArchived must be a boolean';
    }

    return true;
};

//section validations
const isSectionCodeValid = (sectionCode) => {
    let sectionCodeStr = String(sectionCode).trim();
    if (sectionCodeStr === undefined || sectionCodeStr === null || sectionCodeStr === '') {
        return 'Section code is required';
    }
    console.log('Checking type for sectionCode:', typeof sectionCode, ' sectionCode:', sectionCode)
    console.log('Checking type for sectionCodeStr:', typeof sectionCodeStr, ' sectionCodeStr:', sectionCodeStr)
    if (sectionCodeStr.length !== 7 || !/^\d{4}-\d{2}$/.test(sectionCodeStr)) {
        return 'Section code must be 7 characters in length and in the format \"nnnn-nn\" where n is a number';
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

// Anthro validations
const isTeacherUserIdValid = (teacherUserId) => {
    if (!teacherUserId) {
        return 'Teacher User ID is required';
    }
    if (teacherUserId < 0) {
        return 'Teacher User ID must be a positive number';
    }
    // If teacherUserId is not an integer, return an error
    if (!Number.isInteger(teacherUserId)) {
        return 'Teacher User ID must be an integer';
    }

    return true;
}

const isHeightValid = (height) => {
    if (!height) {
        return 'Height is required';
    }
    if (height < 0) {
        return 'Height must be a positive number';
    }
    // If height is not an integer, return an error
    if (!Number.isInteger(height)) {
        return 'Height must be an integer';
    }

    return true;
}


const isWeightValid = (weight) => {
    if (!weight) {
        return 'Weight is required';
    }
    if (weight < 0) {
        return 'Weight must be a positive number';
    }
    // If weight is not an integer, return an error
    if (!Number.isInteger(weight)) {
        return 'Weight must be an integer';
    }
    
    return true;
}

const isDateRecordedValid = (dateRecorded) => {
    if (!dateRecorded) {
        return 'Date recorded is required';
    }
    if (!moment(dateRecorded, 'YYYY-MM-DD', true).isValid()) {
        return 'Date recorded must be in the following format (YYYY-MM-DD)';
    }
    return true;
}



module.exports = {
    isEmailValid,
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
    isSectionActiveValid,
    isTeacherUserIdValid,
    isHeightValid,
    isWeightValid,
    isDateRecordedValid,
}