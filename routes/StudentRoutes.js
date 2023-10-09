const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');  // Ensure you import the sequelize instance.
const { User, StudentDetail, StudentAnthro } = require('../models');

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
      },
      {
        model: StudentAnthro,
        as: 'studentAnthro'
      }]
    });

    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server error');
  }
});

// Other student-specific routes can go here...

router.patch('/students/:id', async (req, res) => {
  const { id } = req.params; // Extracting student ID from the route parameter.
  const { password, studentDetails } = req.body; // Extracting password and studentDetails from the request body.

  if (!id) return res.status(400).json({ error: 'Student ID is required' });

  try {
    const transaction = await sequelize.transaction();
    // Find the student by ID and include the associated StudentDetail.
    const student = await User.findByPk(id, {
      include: [{
        model: StudentDetail,
        as: 'studentDetails'
      }]
    });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    const updateFields = {
      email: req.body.email || student.email,
      password: req.body.password ? await bcrypt.hash(password, 10) : student.password,
      firstName: req.body.firstName || student.firstName,
      lastName: req.body.lastName || student.lastName,
      birthDate: req.body.birthDate || student.birthDate,
      userType: req.body.userType || student.userType,
      genderIdentity: req.body.genderIdentity || student.genderIdentity,
      pronouns: req.body.pronouns || student.pronouns,
      photoUrl: req.body.photoUrl || student.photoUrl
    }
    // Update the student's fields if they are provided.
    await student.update(updateFields, { transaction });

    // Update fields in the associated StudentDetail.
    if (student.studentDetails && studentDetails) { // Ensure studentDetails from req.body is also not undefined.
      const studentDetailUpdates = {
        gradYear: studentDetails.gradYear || student.studentDetails.gradYear // Fixed semicolon here.
      };
      await student.studentDetails.update(studentDetailUpdates, { transaction });
    } else {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student details not found' });
    }

    // Return the updated student with associated details.
    res.status(200).json(student);

  } catch (error) {
    console.error('Error in updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
