class BaseDTO {
    constructor(object, fields) {
        fields.forEach(field => {
            if (object[field] !== undefined) {
                this[field] = object[field];
            }
        });
    }
}

module.exports = BaseDTO;
