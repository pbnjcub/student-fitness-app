const BaseDto = require('../../dto/BaseDto');

const StudentDetailDto = require('./StudentDetailDto');
const TeacherDetailDto = require('./TeacherDetailDto');
const AdminDetailDto = require('./AdminDetailDto');
const StudentAnthroDto = require('./StudentAnthroDto');

class UserDto extends BaseDto {
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
            fieldsConfig['studentDetails'] = StudentDetailDto;
            fieldsConfig['studentAnthro'] = StudentAnthroDto;
        } else if (user.userType === 'teacher') {
            fieldsConfig['teacherDetails'] = TeacherDetailDto;
        } else if (user.userType === 'admin') {
            fieldsConfig['adminDetails'] = AdminDetailDto;
        }

        super(user, fieldsConfig);

        // Handle instantiation of the specific details if they exist
        if (user.userType === 'student' && user.studentDetails) {
            this.studentDetails = new StudentDetailDto(user.studentDetails);
            if (user.studentAnthro) {
                this.studentAnthro = new StudentAnthroDto(user.studentAnthro);
            }
            // Add only the sectionCode from the section information if it exists
            if (user.sectionRoster && user.sectionRoster.section) {
                this.sectionCode = user.sectionRoster.section.sectionCode;
            }
        } else if (user.userType === 'teacher' && user.teacherDetails) {
            this.teacherDetails = new TeacherDetailDto(user.teacherDetails);
        } else if (user.userType === 'admin' && user.adminDetails) {
            this.adminDetails = new AdminDetailDto(user.adminDetails);
        }
    }
}

module.exports = UserDto;
