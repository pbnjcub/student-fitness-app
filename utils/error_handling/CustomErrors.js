// customErrors.js

class UserDetailUpdateError extends Error {
    constructor(userType, message) {
        super(`Error updating ${userType} details: ${message}`);
        this.name = "UserDetailUpdateError";
        this.userType = userType;
    }
}

module.exports = { UserDetailUpdateError };
