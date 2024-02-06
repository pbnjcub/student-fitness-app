const BaseDTO = require('./BaseDTO');

class TeacherDetailDTO extends BaseDTO {
    constructor(teacherDetail) {
        super(teacherDetail, {
            'yearsExp': true,
            'bio': true,
        });
    }
}

module.exports = TeacherDetailDTO;