class BaseDTO {
    constructor(object = {}, fields = {}) {
        if (typeof fields !== 'object' || typeof object !== 'object') {
            throw new Error('Invalid parameters for BaseDTO');
        }

        Object.keys(fields).forEach(field => {
            if (object[field] !== undefined) {
                if (Array.isArray(object[field])) {
                    this[field] = object[field].map(item =>
                        fields[field] && typeof fields[field] === 'function'
                            ? new fields[field](item)
                            : item
                    );
                } else if (object[field] !== null && typeof object[field] === 'object') {
                    this[field] = fields[field] === true ? object[field] : new fields[field](object[field]);
                } else {
                    this[field] = object[field];
                }
            }
        });
    }
}

module.exports = BaseDTO;
