const BaseDTO = require('./BaseDTO');

class UserDTO extends BaseDTO {
    constructor(user) {
        super(user, [
            'id',
            'email',
            'lastName',
            'firstName',
            'birthDate',
            'genderIdentity',
            'pronouns',
            'userType',
            'photoUrl',
            'isArchived',
            'dateArchived'
        ]);
    }
}

module.exports = UserDTO;