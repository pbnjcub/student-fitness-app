class BaseDTO {
    constructor(object = {}, fields = {}) {
        if (typeof fields !== 'object' || typeof object !== 'object') {
            throw new Error('Invalid parameters for BaseDTO');
        }

        Object.keys(fields).forEach(field => {

            try {
                // Skip fields explicitly marked as false for exclusion
                if (fields[field] === false) {
                    return;
                }

                // Check if the field exists in the input object
                if (object[field] !== undefined) {
                    // Handle arrays of objects potentially requiring DTO conversion
                    if (Array.isArray(object[field])) {
                        this[field] = object[field].map(item => {
                            if (fields[field] && typeof fields[field] === 'function') {
                                // Attempt to instantiate a DTO for each item in the array
                                return new fields[field](item);
                            } else {
                                // If not a DTO, return the item unchanged
                                return item;
                            }
                        });
                    } else if (object[field] !== null && typeof object[field] === 'object') {
                        // For objects, check if they require DTO instantiation
                        if (typeof fields[field] === 'function') {
                            
                            this[field] = new fields[field](object[field]);
                        } else if (fields[field] === true) {
                            // If marked as true, directly assign the object
                            this[field] = object[field];
                        } else {
                            // If the field is not intended to be a DTO, log a warning or handle as needed
                            console.warn(`Warning: The field '${field}' was expected to be a DTO but received a non-function value.`);
                            this[field] = object[field];
                        }
                    } else {
                        // Directly assign values that are not objects or arrays
                        this[field] = object[field];
                    }
                }
            } catch (error) {
                console.error(`Error processing field '${field}': ${error}`);
                // Enhanced error handling for debugging
                throw new Error(`Error processing field '${field}': ${error.message}`);
            }
        });
    }
}

module.exports = BaseDTO;
