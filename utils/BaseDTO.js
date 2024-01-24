class BaseDTO {
    /**
     * Creates an instance of BaseDTO.
     * @param {Object} object - The source object to map data from.
     * @param {string[]} fields - The fields to include in the DTO.
     */
    constructor(object = {}, fields = []) {
        if (!Array.isArray(fields) || typeof object !== 'object') {
            throw new Error('Invalid parameters for BaseDTO');
        }

        fields.forEach(field => {
            if (object[field] !== undefined) {
                this[field] = object[field];
            }
        });
    }
}

module.exports = BaseDTO;
