const BaseDTO = require('./BaseDTO');

class UserDTO extends BaseDTO {
    constructor(user) {
        super(user, {
            'id': true,
            'email': true,
            'lastName': true,
            'firstName': true,
            'birthDate': true,
            'genderIdentity': true,
            'pronouns': true,
            'userType': true,
            'photoUrl': true,
            'isArchived': true,
            'dateArchived': true
        });
    }
}

module.exports = UserDTO;
