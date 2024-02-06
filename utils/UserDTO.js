const BaseDTO = require('./BaseDTO');

const StudentDetailDTO = require('./StudentDetailDTO');
const TeacherDetailDTO = require('./TeacherDetailDTO');
const AdminDetailDTO = require('./AdminDetailDTO');
const StudentAnthroDTO = require('./StudentAnthroDTO');

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
            'dateArchived': true,
            'studentDetails': StudentDetailDTO,
            'teacherDetails': TeacherDetailDTO,
            'adminDetails': AdminDetailDTO,
            'studentAnthro': StudentAnthroDTO,
        });

        if (user.userType === 'student' && user.studentDetails) {
            this.studentDetails = new StudentDetailDTO(user.studentDetails);
            this.studentAnthro = new StudentAnthroDTO(user.studentAnthro);
        } else if (user.userType === 'teacher' && user.teacherDetails) {
            this.teacherDetails = new TeacherDetailDTO(user.teacherDetails);
        } else if (user.userType === 'admin' && user.adminDetails) {
            this.adminDetails = new AdminDetailDTO(user.adminDetails);
        }     
    }
}

module.exports = UserDTO;
