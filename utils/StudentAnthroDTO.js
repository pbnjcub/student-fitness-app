const BaseDTO = require('./BaseDTO');

class StudentAnthroDTO extends BaseDTO {
    constructor(studentAnthro) {
        super(studentAnthro, {
            'teacherUserId': true,
            'studentUserId': true,
            'dateRecorded': true,
            'height': true,
            'weight': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = StudentAnthroDTO;