const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');

const { User, StudentDetail, StudentAnthro, StudentHistAnthro, StudentAssignedPerformanceTest, StudentPerformanceGrade, sequelize } = require('../models');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//middleware
const checkStudentId = (req, res, next) => {
  const student_id = req.params.id;
  if (!student_id) return res.status(400).json({ error: 'Student ID is required' });
  next();
};

//differentiate include by route
function getIncludeOption(route) {
  switch(route) {
    case '/students/:id':
      return [{
        model: StudentDetail,
        as: 'studentDetails'
      },
      {
        model: StudentAnthro,
        as: 'studentAnthro'
      },
      {
        model: StudentHistAnthro,
        as: 'studentHistAnthro'
      },
      {
        model: StudentAssignedPerformanceTest,
        as: 'studentAssignedPerformanceTest'
      },
      {
        model: StudentPerformanceGrade,
        as: 'studentPerformanceGrade'
      }];
    case '/students/:id/add-anthro':
    case '/students/:id/edit-anthro':
    case '/students/:id/assign-performance-test':
      return [];
    default:
      return null;
  }
}

async function findUserByIdWithInclude(id, route) {
  const includeOption = getIncludeOption(route);
  // Handle the case where no additional data is needed
  if (!includeOption) {
    const user = await User.findByPk(id);
    return user;
  } else {
    const user = await User.findByPk(id, { include: includeOption });
    return user;
  }
}

//build userDTO
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

//build studentDTO
function buildStudentDTO(student, studentDTO) {
  if (student.studentDetails) {
    studentDTO.studentDetails = student.studentDetails;
  }
  if (student.studentAnthro) {
    studentDTO.studentAnthro = student.studentAnthro;
  }
  if (student.studentHistAnthro) {
    studentDTO.studentHistAnthro = student.studentHistAnthro;
  }
  if (student.studentAssignedPerformanceTest) {
    studentDTO.studentAssignedPerformanceTest = student.studentAssignedPerformanceTest;
  }
  if (student.studentPerformanceGrade) {
    studentDTO.studentPerformanceGrade = student.studentPerformanceGrade;
  }
}

//build anthroDTO
function newAnthroDTO(anthro) {
  return {
    id: anthro.id,
    teacherUserId: anthro.teacherUserId,
    studentUserId: anthro.studentUserId,
    dateRecorded: anthro.dateRecorded,
    height: anthro.height,
    weight: anthro.weight
  };
}

//check required fields for anthro
const checkRequiredAnthro = (anthroData) => {
  const { teacherUserId, studentUserId, dateRecorded, height, weight } = anthroData;

  const missingFields = [];
  
  if (!teacherUserId) missingFields.push('Teacher ID');
  if (!studentUserId) missingFields.push('Student ID');
  if (!dateRecorded) missingFields.push('Date Recorded');
  if (!height) missingFields.push('Height');
  if (!weight) missingFields.push('Weight');

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;}

//find student anthro by student id
const findAnthroById = async (student_id) => {
  const existingAnthro = await StudentAnthro.findOne({
    where: {
      studentUserId: student_id,
    },
  });

  return existingAnthro;
};

//find latest assigned test by student id and performance type id
const findLatestAssignedByIdAndType = async (student_id, performanceTypeId) => {
  const existingAssigned = await StudentAssignedPerformanceTest.findOne({
    where: {
      studentUserId: student_id,
      performanceTypeId: performanceTypeId,
    },
    order: [['dateAssigned', 'DESC']]
  });

  return existingAssigned;
};

//find grade by test id
const findGradeByTestId = async (testId) => {
  const existingGrade = await StudentPerformanceGrade.findOne({
    where: {
      assignedPerformanceTestId: testId,
    },
  });

  return existingGrade;
};

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
router.get('/students/:id', checkStudentId, async (req, res) => {
  const { id } = req.params;
  const route = req.route.path;

  try {
    const student = await findUserByIdWithInclude(id, route);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.userType !== 'student') {
      return res.status(404).json({ error: 'User is not a student' });
    }

    const studentDTO = userDTO(student);
    buildStudentDTO(student, studentDTO);

    res.json(studentDTO);

  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).send('Server error');
  }
});

//check if anthro exists for student
router.post('/students/:id/check-anthro', checkStudentId, async (req, res) => {
  const student_id = req.params.id;

  try {
    const existingStudentAnthro = await findAnthroById(student_id);

    if (existingStudentAnthro) {
      return res.status(200).json({
        warning: true,
        message: `This student's anthro was last updated on ${existingStudentAnthro.dateRecorded}. Do you want to proceed?`,
      });
    } else {
      return res.status(200).json({
        warning: false,
        message: 'No existing anthro record found for this student. This will be the initial record.',
      });
    }
  } catch (err) {
    console.error('Error checking for existing student anthro:', err);
    res.status(500).send('Server error');
  }
});

//add new student anthro and send existing anthro to history
router.post('/students/:id/add-anthro', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const studentAnthro = req.body;
  const route = req.route.path;

  const requiredCheckAnthro = checkRequiredAnthro(studentAnthro);
  if (requiredCheckAnthro !== true) {
    return res.status(400).json({ error: requiredCheckAnthro });
  }

  try {
    const student = await await findUserByIdWithInclude(student_id, route);

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
        teacherUserId: existingStudentAnthro.teacherUserId,
        studentUserId: existingStudentAnthro.studentUserId,
        dateRecorded: existingStudentAnthro.dateRecorded,
        height: existingStudentAnthro.height,
        weight: existingStudentAnthro.weight,
      });

      // Update the existing studentAnthro entry with the new data
      const updatedStudentAnthro = await existingStudentAnthro.update(studentAnthro);
      res.status(200).json(updatedStudentAnthro);
    } else {
      // Add student IDs to the studentAnthro data
      const newStudentAnthroData = {
        ...studentAnthro,
        studentUserId: student_id,
      };

      // Create a new studentAnthro entry
      const newStudentAnthro = await StudentAnthro.create(newStudentAnthroData);
      res.status(201).json(newAnthroDTO(newStudentAnthro));
    }
  } catch (err) {
    console.error('Error creating or updating student anthro:', err);
    res.status(500).send('Server error');
  }
});

router.post('/students/upload-anthro', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();
    const newAnthros = [];
    const errors = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        const transaction = await sequelize.transaction();
        try {
          for (const anthroData of results.data) {
            // Look up the student ID based on the email address
            const student = await User.findOne({ where: { email: anthroData.email } });
            if (!student) {
              errors.push(`No student found with email ${anthroData.email}`);
              continue;
            }

            // Add the student ID to the anthroData object
            anthroData.studentUserId = parseInt(student.id);
            const requiredCheckAnthro = checkRequiredAnthro(anthroData);
            if (requiredCheckAnthro !== true) {
              errors.push(`${anthroData.firstName} ${anthroData.lastName}: ${requiredCheckAnthro}`);
              continue;
            } else {
              try {
                const newAnthro = await StudentAnthro.create(anthroData, { transaction });
                if (!newAnthro) {
                  errors.push(`${anthroData.firstName} ${anthroData.lastName}: Error creating student anthro`);
                } else {
                  newAnthros.push(newAnthroDTO(newAnthro));
                }
              } catch (error) {
                errors.push(`${anthroData.email}: ${error.message}`);
              }
            }
          }
          if (errors.length > 0) {
            await transaction.rollback();
            res.status(400).json({ errors });
          } else {
            await transaction.commit();
            res.status(201).json({ newAnthros });
          }
        } catch (error) {
          await transaction.rollback();
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });
  } catch (error) {
    console.error('Error uploading student anthro:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//update anthro
router.patch('/students/:id/edit-anthro', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const studentAnthro = req.body;
  const route = req.route.path;
  
  const requiredCheckAnthro = checkRequiredAnthro(studentAnthro);
  if (requiredCheckAnthro !== true) {
    return res.status(400).json({ error: requiredCheckAnthro });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

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
      // Update the existing studentAnthro entry with the new data
      const updatedStudentAnthro = await existingStudentAnthro.update(studentAnthro);
      res.status(200).json(updatedStudentAnthro);
    } else {
      return res.status(404).json({ error: 'Student anthro not found' });
    }
  } catch (err) {
    console.error('Error updating student anthro:', err);
    res.status(500).send('Server error');
  }
});

//check if performance test was assigned to student.
router.post('/students/:id/check-assigned-performance', checkStudentId, async (req, res) => {
  const student_id = req.params.id;

  try {
    const existingAssigned = await findLatestAssignedByIdAndType(student_id, req.body.performanceTypeId);

    if (existingAssigned) {
      // Check if the test has been graded
      const existingGrade = await findGradeByTestId(existingAssigned.id);

      const dateAssigned = existingAssigned.dateAssigned.toISOString().slice(0, 10);

      if (existingGrade) {
        return res.status(200).json({
          warning: true,
          message: `This student's performance test was last assigned on ${dateAssigned} and has already been graded. Do you want to proceed?`,
        });
      } else {
        return res.status(200).json({
          warning: true,
          message: `This student's performance test was last assigned on ${dateAssigned} and is ungraded. Do you want to proceed?`,
        });
      }
    } else {
      return res.status(200).json({
        warning: false,
        message: 'No existing test record found for this student. This will be the initial record.',
      });
    }
  } catch (err) {
    console.error('Error checking for existing student test:', err);
    res.status(500).send('Server error');
  }
});


//assign performance test to student
router.post('/students/:id/assign-performance-test', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const performanceTest = req.body;
  const route = req.route.path;

  try {
    const student = await findUserByIdWithInclude(student_id, route);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Add teacher and student IDs to the performanceTest data
    const newPerformanceTestData = {
      ...performanceTest,
      studentUserId: student_id,
    };

    // Create a new performanceTest entry
    const newPerformanceTest = await StudentAssignedPerformanceTest.create(newPerformanceTestData);
    res.status(201).json(newPerformanceTest);
  } catch (err) {
    console.error('Error creating student performance test:', err);
    res.status(500).send('Server error');
  }
});


// Update a student
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
