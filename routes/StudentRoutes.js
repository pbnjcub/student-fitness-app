const express = require('express');
const router = express.Router();
const { User, StudentDetail } = require('../models');

// Helper function to format student data
const formatStudentData = (student) => {
  const { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, studentDetails } = student;

  const formattedBirthDate = birthDate.toISOString().split('T')[0];
  
  return {
    id, 
    email, 
    lastName, 
    firstName, 
    birthDate: formattedBirthDate, 
    genderIdentity, 
    pronouns, 
    userType, 
    studentDetails 
  };
}

// Retrieve all student users
router.get('/students', async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        userType: 'student'
      },
      include: [{
        model: StudentDetail,
        as: 'studentDetails'
      }]
    });

    const modifiedStudents = students.map(student => formatStudentData(student));

    res.json(modifiedStudents);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server error');
  }
});

// Other student-specific routes can go here...
router.patch('/students/:id', async (req, res) => {
  const { id } = req.params; // Extracting student ID from the route parameter.
  const { email, password, firstName, lastName, birthDate, genderIdentity, pronounsgradYear } = req.body; // Extracting fields from the request body.

  if (!id) return res.status(400).json({ error: 'Student ID is required' });

  try {
    // Find the student by ID and include the associated StudentDetail.
    const student = await User.findByPk(id, {
      include: [{
        model: StudentDetail,
        as: 'studentDetails'
      }]
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Update the student's fields if they are provided.
    if (email) student.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Ensure you've imported bcrypt at the top of your file.
      student.password = hashedPassword;
    }
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (birthDate) student.birthDate = birthDate;

    // Update fields in the associated StudentDetail.
    if (student.studentDetails) {
      if (gradYear) student.studentDetails.gradYear = gradYear;
      await student.studentDetails.save();
    }

    // Save the updated student object.
    await student.save();

    const formattedStudent = formatStudentData(student);

    // Return the updated student with associated details.
    res.status(200).json(formattedStudent);

  } catch (error) {
    console.error('Error in updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
