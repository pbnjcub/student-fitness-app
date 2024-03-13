const BaseDTO = require('./BaseDTO');

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