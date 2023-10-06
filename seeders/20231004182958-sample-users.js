'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      // Teacher users
      {
        email: 'richmuller@example.com',
        password: 'richmuller',
        lastName: 'Muller',
        firstName: 'Rich',
        birthDate: new Date('1965-05-15'),
        genderIdentity: 'cis',
        pronouns: 'He/Him/His',
        userType: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'kierstenmulvey@example.com',
        password: 'kierstenmulvey',
        lastName: 'Mulvey',
        firstName: 'Kiersten',
        birthDate: new Date('1986-05-16'),
        genderIdentity: 'cis',
        pronouns: 'She/Her/Hers',
        userType: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Student users
      {
        email: 'bentausner@example.com',
        password: 'bentausner',
        lastName: 'Tausner',
        firstName: 'Ben',
        birthDate: new Date('2000-05-15'),
        genderIdentity: 'cis',
        pronouns: 'He/Him/His',
        userType: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'paigemccullough@example.com',
        password: 'paigemccullough',
        lastName: 'McCullough',
        firstName: 'Paige',
        birthDate: new Date('2001-05-16'),
        genderIdentity: 'cis',
        pronouns: 'She/Her/Hers',
        userType: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Admin users
      {
        email: 'michellecarstens@example.com',
        password: 'michellecarstens',
        lastName: 'Carstens',
        firstName: 'Michelle',
        birthDate: new Date('1985-05-15'),
        genderIdentity: 'cis',
        pronouns: 'She/Her/Hers',
        userType: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'liztraub@example.com',
        password: 'liztraub',
        lastName: 'Traub',
        firstName: 'Liz',
        birthDate: new Date('1965-05-16'),
        genderIdentity: 'Cis',
        pronouns: 'She/Her/Hers',
        userType: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const insertedUsers = await queryInterface.sequelize.query(`SELECT id, "userType" FROM users WHERE email IN ('richmuller@example.com', 'kierstenmulvey@example.com', 'bentausner@example.com', 'paigemccullough@example.com', 'michellecarstens@example.com', 'liztraub@example.com')`);
    const studentDetails = [];
    const teacherDetails = [];
    const adminDetails = [];

    insertedUsers[0].forEach(user => {
      switch (user.userType) {
        case 'student':
          const studentDetail = {
            userId: user.id,
            gradYear: (user.email === 'bentausner@example.com') ? 2023 : 2024,
            // Add more fields as necessary.
            createdAt: new Date(),
            updatedAt: new Date()
          };
          studentDetails.push(studentDetail);
          break;

        case 'teacher':
          const teacherDetail = {
            userId: user.id,
            yearsExp: (user.email === 'kierstenmulvey@example.com') ? 5 : 10,
            bio: (user.email === 'kierstenmulvey@example.com') ? "Teaching with passion!" : "Experienced educator",
            createdAt: new Date(),
            updatedAt: new Date()
          };
          teacherDetails.push(teacherDetail);
          break;

        case 'admin':
          const adminDetail = {
            userId: user.id,
            yearsExp: (user.email === 'michellecarstens@example.com') ? 10 : 15,
            bio: (user.email === 'michellecarstens@example.com') ? "Administrator with a decade of experience." : "Senior administrator",
            createdAt: new Date(),
            updatedAt: new Date()
          };
          adminDetails.push(adminDetail);
          break;
      }
    });

    await queryInterface.bulkInsert('student_details', studentDetails);
    await queryInterface.bulkInsert('teacher_details', teacherDetails);
    await queryInterface.bulkInsert('admin_details', adminDetails);
    

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('student_details', null, {});
    await queryInterface.bulkDelete('teacher_details', null, {});
    await queryInterface.bulkDelete('admin_details', null, {});
  }
};
