const BaseDto = require('../../dto/BaseDto');

class TeacherDetailDto extends BaseDto {
    constructor(teacherDetail) {
        super(teacherDetail, {
            'yearsExp': true,
            'bio': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = TeacherDetailDto;