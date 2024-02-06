const BaseDTO = require('./BaseDTO');

class AdminDetailDTO extends BaseDTO {
    constructor(adminDetail) {
        super(adminDetail, {
            'yearsExp': true,
            'bio': true,
        });
    }
}

module.exports = AdminDetailDTO;