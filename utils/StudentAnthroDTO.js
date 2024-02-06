const BaseDTO = require('./BaseDTO');

class StudentAnthroDTO extends BaseDTO {
    constructor(studentAnthro) {
        super(studentAnthro, {
            'teacherUserId': true,
            'studentUserId': true,
            'dateRecorded': true,
            'height': true,
            'weight': true,
        });
    }
}

module.exports = StudentAnthroDTO;