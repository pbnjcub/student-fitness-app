const BaseDTO = require('./BaseDTO');

const StudentDetailDTO = require('./StudentDetailDTO');
const TeacherDetailDTO = require('./TeacherDetailDTO');
const AdminDetailDTO = require('./AdminDetailDTO');
const StudentAnthroDTO = require('./StudentAnthroDTO');

class UserDTO extends BaseDTO {
    constructor(user) {
        // Initialize with base fields
        let fieldsConfig = {
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
            'password': false,
            'createdAt': false,
            'updatedAt': false,
        };

        // Dynamically add detail fields based on the user type
        if (user.userType === 'student') {
            fieldsConfig['studentDetails'] = StudentDetailDTO;
            fieldsConfig['studentAnthro'] = StudentAnthroDTO;
        } else if (user.userType === 'teacher') {
            fieldsConfig['teacherDetails'] = TeacherDetailDTO;
        } else if (user.userType === 'admin') {
            fieldsConfig['adminDetails'] = AdminDetailDTO;
        }

        super(user, fieldsConfig);

        // Now handle instantiation of the specific details if they exist
        if (user.userType === 'student' && user.studentDetails) {
            this.studentDetails = new StudentDetailDTO(user.studentDetails);
            if (user.studentAnthro) {
                this.studentAnthro = new StudentAnthroDTO(user.studentAnthro);
            }
        } else if (user.userType === 'teacher' && user.teacherDetails) {
            this.teacherDetails = new TeacherDetailDTO(user.teacherDetails);
        } else if (user.userType === 'admin' && user.adminDetails) {
            this.adminDetails = new AdminDetailDTO(user.adminDetails);
        }
    }
}

module.exports = UserDTO;

