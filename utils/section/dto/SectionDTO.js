const BaseDTO = require('../../dto/BaseDTO');

class SectionDTO extends BaseDTO {
    constructor(section) {
        super(section, {
            'id': true,
            'sectionCode': true,
            'gradeLevel': true,
            'isActive': true
        });
    }
}

class SectionByIdDTO extends BaseDTO {
    constructor(section) {
        super(section, {
            'id': true,
            'sectionCode': true,
            'gradeLevel': true,
            'isActive': true,
            'sectionRoster': StudentRosterDTO
        });
    }
}

class StudentRosterDTO extends BaseDTO {
    constructor(rosterItem) {
        super(rosterItem, {
            'id': true,
            'studentUserId': true,
            'sectionId': true,
            'student': StudentDTO
        });
    }
}

class StudentDTO extends BaseDTO {
    constructor(student) {
        super(student, {
            'id': true,
            'firstName': true,
            'lastName': true,
            'birthDate': true,
            'userType': true,
            'studentDetails': StudentDetailsDTO
        });
    }
}

class StudentDetailsDTO extends BaseDTO {
    constructor(details) {
        super(details, {
            'id': true,
            'gradYear': true
        });
    }
}

module.exports = {
    SectionDTO,
    SectionByIdDTO
};