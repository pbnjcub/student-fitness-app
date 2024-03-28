const BaseDTO = require('../../dto/BaseDTO');

class AdminDetailDTO extends BaseDTO {
    constructor(adminDetail) {
        super(adminDetail, {
            'yearsExp': true,
            'bio': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = AdminDetailDTO;