const BaseDTO = require('../../dto/BaseDTO');

class StudentDetailDTO extends BaseDTO {
    constructor(studentDetail) {
        super(studentDetail, {
            'gradYear': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = StudentDetailDTO;