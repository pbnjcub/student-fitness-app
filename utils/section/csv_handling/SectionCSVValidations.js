// sectionValidations.js

const isSectionCodeValid = (sectionCode) => {
    let sectionCodeStr = String(sectionCode).trim();
    if (!sectionCodeStr) {
        return 'Section code is required';
    }
    if (sectionCodeStr.length !== 7 || !/^\d{4}-\d{2}$/.test(sectionCodeStr)) {
        return 'Section code must be 7 characters in length and in the format "nnnn-nn" where n is a number';
    }
    return true;
};

const isSectionGradeLevelValid = (gradeLevel) => {
    let sectionGradeLevelStr = String(gradeLevel).trim();
    if (!sectionGradeLevelStr) {
        return 'Grade level is required';
    }
    if (!['6', '7', '8', '9', '10-11-12'].includes(sectionGradeLevelStr)) {
        return 'Grade level must be either "6", "7", "8", "9", or "10-11-12"';
    }
    return true;
};

const isSectionActiveValid = (isActive) => {
    if (isActive === undefined || isActive === null || isActive === '') {
        return 'isActive is required';
    }
    if (typeof isActive !== 'boolean') {
        return 'isActive must be a boolean';
    }
    return true;
};

module.exports = {
    isSectionCodeValid,
    isSectionGradeLevelValid,
    isSectionActiveValid
};
