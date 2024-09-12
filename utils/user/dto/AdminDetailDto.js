const BaseDto = require('../../dto/BaseDto');

class AdminDetailDto extends BaseDto {
    constructor(adminDetail) {
        super(adminDetail, {
            'yearsExp': true,
            'bio': true,
            'createdAt': false,
            'updatedAt': false,
        });
    }
}

module.exports = AdminDetailDto;