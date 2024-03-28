const BaseDTO = require('../../dto/BaseDTO');

class TeacherDetailDTO extends BaseDTO {
    constructor(teacherDetail) {
        super(teacherDetail, {
            'yearsExp': true,
            'bio': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = TeacherDetailDTO;