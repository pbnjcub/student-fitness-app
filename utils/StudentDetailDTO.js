const BaseDTO = require('./BaseDTO');

class StudentDetailDTO extends BaseDTO {
    constructor(studentDetail) {
        super(studentDetail, {
            'gradYear': true,
        });
    }
}

module.exports = StudentDetailDTO;