const BaseDTO = require('./BaseDTO');

class SectionDTO extends BaseDTO {
    constructor(section) {
        super(section, {
            'id': true,
            'sectionCode': true,
            'gradeLevel': true,
            'isActive': true
        });
    }
}

// class SectionByIdDTO extends BaseDTO {}

module.exports = SectionDTO;