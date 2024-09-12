const BaseDto = require('../../dto/BaseDto');

class SectionDto extends BaseDto {
    constructor(section) {
        super(section, {
            'id': true,
            'sectionCode': true,
            'gradeLevel': true,
            'isActive': true
        });
    }
}

class SectionByIdDto extends BaseDto {
    constructor(section) {
        super(section, {
            'id': true,
            'sectionCode': true,
            'gradeLevel': true,
            'isActive': true,
            'sectionRoster': StudentRosterDto
        });
    }
}

class StudentRosterDto extends BaseDto {
    constructor(rosterItem) {
        super(rosterItem, {
            'id': true,
            'studentUserId': true,
            'sectionId': true,
            'student': StudentDto
        });
    }
}

class StudentDto extends BaseDto {
    constructor(student) {
        super(student, {
            'id': true,
            'firstName': true,
            'lastName': true,
            'birthDate': true,
            'userType': true,
            'studentDetails': StudentDetailsDto
        });
    }
}

class StudentDetailsDto extends BaseDto {
    constructor(details) {
        super(details, {
            'id': true,
            'gradYear': true
        });
    }
}

module.exports = {
    SectionDto,
    SectionByIdDto
};