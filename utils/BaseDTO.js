class BaseDTO {
    /**
     * Creates an instance of BaseDTO.
     * @param {Object} object - The source object to map data from.
     * @param {Object} fields - The fields to include in the DTO. This can now be an object with nested fields.
     */
    constructor(object = {}, fields = {}) {
        if (typeof fields !== 'object' || typeof object !== 'object') {
            throw new Error('Invalid parameters for BaseDTO');
        }

        Object.keys(fields).forEach(field => {
            if (object[field] !== undefined) {
                if (Array.isArray(object[field])) {
                    this[field] = object[field].map(item =>
                        typeof fields[field] === 'function' && item instanceof fields[field]
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
