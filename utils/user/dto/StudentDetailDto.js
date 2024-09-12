const BaseDto = require('../../dto/BaseDto');

class StudentDetailDto extends BaseDto {
    constructor(studentDetail) {
        super(studentDetail, {
            'gradYear': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = StudentDetailDto;