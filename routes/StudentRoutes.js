const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sequelize } = require('../models'); 
const { User, StudentDetail, StudentAnthro, StudentHistAnthro, StudentAssignedPerformanceTest, StudentPerformanceGrade } = require('../models');

function userDTO(user) {
  return {
      id: user.id,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      birthDate: user.birthDate,
      genderIdentity: user.genderIdentity,
      pronouns: user.pronouns,
      userType: user.userType,
      photoUrl: user.photoUrl,
      isArchived: user.isArchived,
      dateArchived: user.dateArchived
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

    const studentsDTO = students.map(student => {
      const studentDTO = userDTO(student);
      studentDTO.studentDetails = student.studentDetails;
      return studentDTO;
    });

    res.json(studentsDTO);

  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server error');
  }
});


//get student by id
router.get('/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findByPk(id, {
      include: [{
        model: StudentDetail,
        as: 'studentDetails'
      },
      {
        model: StudentAnthro,
        as: 'studentAnthro'
      },
      {
        model: StudentAssignedPerformanceTest,
        as: 'studentAssignedPerformanceTest'
      },
      {
        model: StudentPerformanceGrade,
        as: 'studentPerformanceGrade'
      }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.userType !== 'student') {
      return res.status(404).json({ error: 'User is not a student' });
    }

    const studentDTO = userDTO(student);
    studentDTO.studentDetails = student.studentDetails;
    studentDTO.studentAnthro = student.studentAnthro;
    studentDTO.studentAssignedPerformanceTest = student.studentAssignedPerformanceTest;
    studentDTO.studentPerformanceGrade = student.studentPerformanceGrade;

    res.json(studentDTO);

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).send('Server error');
  }
});

// create student anthro
router.post('/students/:id/add-anthro', async (req, res) => {
  console.log('hit create student anthro')
  const student_id = req.params.id;
  const studentAnthro = req.body;

  if (!student_id) return res.status(400).json({ error: 'Student ID is required' });

  try {
    const student = await User.findByPk(student_id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if a studentAnthro entry exists
    const existingStudentAnthro = await StudentAnthro.findOne({
      where: {
        studentUserId: student_id,
      },
    });

    if (existingStudentAnthro) {
      // Create a new entry in StudentHistAnthro with the existing data
      await StudentHistAnthro.create({
        originalAnthroId: existingStudentAnthro.id,
        teacherUserId: existingStudentAnthro.teacher_id,
        studentUserId: existingStudentAnthro.student_id,
        date_recorded: existingStudentAnthro.date_recorded,
        height: existingStudentAnthro.height,
        weight: existingStudentAnthro.weight,
      });

      // Update the existing studentAnthro entry with the new data
      const updatedStudentAnthro = await existingStudentAnthro.update(studentAnthro);
      res.status(200).json(updatedStudentAnthro);
    } else {
      // Add teacher and student IDs to the studentAnthro data
      const newStudentAnthroData = {
        ...studentAnthro,
        teacherUserId: studentAnthro.teacherUserId,
        studentUserId: student_id,
      };

      // Create a new studentAnthro entry
      const newStudentAnthro = await StudentAnthro.create(newStudentAnthroData);
      res.status(201).json(newStudentAnthro);
    }

  } catch (err) {
    console.error('Error creating or updating student anthro:', err);
    res.status(500).send('Server error');
  }
});


router.patch('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { password, studentDetails } = req.body;

  if (!id) return res.status(400).json({ error: 'Student ID is required' });

  try {
    const transaction = await sequelize.transaction();

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
