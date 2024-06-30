const BaseDTO = require('../../dto/BaseDTO');

class ModuleDTO extends BaseDTO {
    constructor(module) {
        super(module, {
            'id': true,
            'title': true,
            'moduleLevel': true,
            'description': true,
            'isActive': true
        });
    }
}

module.exports = ModuleDTO;
