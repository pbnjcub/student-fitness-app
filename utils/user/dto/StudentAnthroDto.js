const BaseDto = require('../../dto/BaseDto');

class StudentAnthroDto extends BaseDto {
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

module.exports = StudentAnthroDto;