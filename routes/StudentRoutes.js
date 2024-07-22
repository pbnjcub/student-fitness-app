const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Papa = require('papaparse');

const { User, StudentDetail, StudentAnthro, StudentHistAnthro, StudentAssignedPerformanceTest, StudentAssignedPerformanceTestHistory, StudentPerformanceGrade, StudentPerformanceGradesHistory, sequelize } = require('../models');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//middleware
const checkStudentId = (req, res, next) => {
  const student_id = req.params.id;
  if (!student_id) return res.status(400).json({ errs: 'Student ID is required' });
  next();
};

//differentiate include by route
function getIncludeOption(route) {
let options;

  switch(route) {
    case '/students/:id':
      options = [
        {
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
        as: 'studentAssignedPerformanceTest',
      },
      {
        model: StudentAssignedPerformanceTestHistory,
        as: 'studentAssignedPerformanceTestHistory',
      }];
      break;
    case '/students/:id/add-anthro':
    case '/students/:id/edit-anthro':
    case '/students/:id/assign-performance-test':
      options = [];
    default:
      options = null;
  }
  return options;
}



async function findUserByIdWithInclude(id, route) {
  const includeOption = getIncludeOption(route);
  
  let user;

  try {
  if (!includeOption) {
    user = await User.findByPk(id);
  } else {
    user = await User.findByPk(id, { include: includeOption });
  }

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check if the retrieved user is a student
  if (user.userType !== 'student') {
    const err = new Error('User is not a student');
    err.statusCode = 404;
    throw err;
  }
} catch (err) {
  throw err;
}

  return user;
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
  if (student.studentAssignedPerformanceTestHistory) {
    studentDTO.studentAssignedPerformanceTestHistory = student.studentAssignedPerformanceTestHistory;
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

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
}

//find student anthro by student id
const findAnthroById = async (student_id) => {
  const existingAnthro = await StudentAnthro.findOne({
    where: {
      studentUserId: student_id,
    },
  });

  return existingAnthro;
};

const checkRequiredAssignedPerformance = (performanceData) => {
  const { performanceTypeId, teacherUserId, studentUserId, dateAssigned } = performanceData;

  const missingFields = [];
  
  if (!teacherUserId) missingFields.push('Teacher ID');
  if (!studentUserId) missingFields.push('Student ID');
  if (!dateAssigned) missingFields.push('Date Assigned');
  if (!performanceTypeId) missingFields.push('Performance Type ID');

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
}

//check required fields for performance grade
const checkRequiredPerformanceGrade = (performanceGradeData) => {
  const { assignedPerformanceTestId, dateTaken, grade } = performanceGradeData;

  const missingFields = [];

  if (!assignedPerformanceTestId) missingFields.push('Assigned Performance Test ID');
  if (!dateTaken) missingFields.push('Date Taken');
  if (!grade) missingFields.push('Grade');

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
}


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

async function getGrades(studentDTO) {
  // Check if the array is not empty
  if (!studentDTO.studentAssignedPerformanceTest || studentDTO.studentAssignedPerformanceTest.length === 0) {
    return;
  }

  // Use Promise.all to wait for all the findGradeByTestId promises to resolve
  const gradesPromises = studentDTO.studentAssignedPerformanceTest.map(async (test) => {
    const gradeObj = await findGradeByTestId(test.id);
    if (gradeObj) {
      const testJson = test.toJSON();
      testJson.performanceGrade = gradeObj;
      return testJson;
    }
    return test.toJSON();
  });

  // Resolve all promises
  const assignedPerformanceWithGrades = await Promise.all(gradesPromises);

  // Re-assign the enriched array back to the studentDTO
  studentDTO.studentAssignedPerformanceTest = assignedPerformanceWithGrades;
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
    res.status(500).send('Server error');
  }
});

//get student by id
router.get('/students/:id', checkStudentId, async (req, res) => {
  const { id } = req.params;
  const route = req.route.path;

  try {
    const student = await findUserByIdWithInclude(id, route);
 
    const studentDTO = userDTO(student);

    buildStudentDTO(student, studentDTO);
    await getGrades(studentDTO);

    res.json(studentDTO);

  } catch (err) {
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
    res.status(500).send('Server error');
  }
});

//add new student anthro and send existing anthro to history
router.post('/students/:id/add-anthro', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const studentAnthro = req.body;
  const route = req.route.path;

  //add student id to anthro data
  const newStudentAnthro = {
    ...studentAnthro,
    studentUserId: student_id,
  };

  const requiredCheckAnthro = checkRequiredAnthro(newStudentAnthro);
  if (requiredCheckAnthro !== true) {
    return res.status(400).json({ err: requiredCheckAnthro });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

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
      const updatedStudentAnthro = await existingStudentAnthro.update(newStudentAnthro);
      res.status(200).json(updatedStudentAnthro);
    } else {

      // Create a new studentAnthro entry
      const newStudentAnthro = await StudentAnthro.create(newStudentAnthro);
      res.status(201).json(newAnthroDTO(newStudentAnthro));
    }
  } catch (err) {
    res.status(err.status || 500).json({ errs: err.message || 'Internal Server Error' });
  }
});

router.post('/students/upload-anthro', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();
    const newAnthros = [];
    const errs = [];

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
              errs.push(`No student found with email ${anthroData.email}`);
              continue;
            }

            // Add the student ID to the anthroData object
            anthroData.studentUserId = parseInt(student.id);
            const requiredCheckAnthro = checkRequiredAnthro(anthroData);
            if (requiredCheckAnthro !== true) {
              errs.push(`${anthroData.firstName} ${anthroData.lastName}: ${requiredCheckAnthro}`);
              continue;
            } else {
              try {
                const newAnthro = await StudentAnthro.create(anthroData, { transaction });
                if (!newAnthro) {
                  errs.push(`${anthroData.firstName} ${anthroData.lastName}: Error creating student anthro`);
                } else {
                  newAnthros.push(newAnthroDTO(newAnthro));
                }
              } catch (err) {
                errs.push(`${anthroData.email}: ${err.message}`);
              }
            }
          }
          if (errs.length > 0) {
            await transaction.rollback();
            res.status(400).json({ errs });
          } else {
            await transaction.commit();
            res.status(201).json({ newAnthros });
          }
        } catch (err) {
          await transaction.rollback();
          res.status(500).json({ errs: 'Internal Server Error' });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ errs: 'Internal Server Error' });
  }
});

//update anthro
router.patch('/students/:id/edit-anthro', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const studentAnthro = req.body;
  const route = req.route.path;

    //add student id to anthro data
    const editedStudentAnthro = {
      ...studentAnthro,
      studentUserId: student_id,
    };
  
  
  const requiredCheckAnthro = checkRequiredAnthro(editedStudentAnthro);
  if (requiredCheckAnthro !== true) {
    return res.status(400).json({ errs: requiredCheckAnthro });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

    // Check if a studentAnthro entry exists
    const existingStudentAnthro = await StudentAnthro.findOne({
      where: {
        studentUserId: student_id,
      },
    });

    if (existingStudentAnthro) {
      // Update the existing studentAnthro entry with the new data
      const updatedStudentAnthro = await existingStudentAnthro.update(editedStudentAnthro);
      res.status(200).json(updatedStudentAnthro);
    } else {
      return res.status(404).json({ errs: 'Student anthro not found' });
    }
  } catch (err) {
    res.status(err.status || 500).json({ errs: err.message || 'Internal Server Error' });
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

      const dateAssigned = existingAssigned.dateAssigned;

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
    console.error(err);
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

    // Add teacher and student IDs to the performanceTest data
    const newPerformanceTestData = {
      ...performanceTest,
      studentUserId: student_id,
    };



    const requiredCheckAssignedPerformance = checkRequiredAssignedPerformance(newPerformanceTestData);
    if (requiredCheckAssignedPerformance !== true) {
      return res.status(400).json({ errs: requiredCheckAssignedPerformance });
    }

    // Create a new performanceTest entry
    const newPerformanceTest = await StudentAssignedPerformanceTest.create(newPerformanceTestData);
    res.status(201).json(newPerformanceTest);
  } catch (err) {
    res.status(err.status || 500).json({ errs: err.message || 'Internal Server Error' });

  }
});


//edit assigned performance test
router.patch('/students/:id/edit-assigned-performance/:testId', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const test_id = req.params.testId;
  const assignedPerformance = req.body;
  const route = req.route.path;
  
  const requiredCheckAssignedPerformance = checkRequiredAssignedPerformance(assignedPerformance);
  if (requiredCheckAssignedPerformance !== true) {
    return res.status(400).json({ errs: requiredCheckAssignedPerformance });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

    // Check if an assigned performance entry exists
    const assignedTest = await StudentAssignedPerformanceTest.findByPk(test_id);

    if (!assignedTest) {
      return res.status(404).json({ errs: 'Performance test not found' });
    }

    // Update the existing assigned Performance
    const updatedAssignedPerformance = await assignedTest.update(assignedPerformance);
    res.status(200).json(updatedAssignedPerformance);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

//add grade to performance test
router.post('/students/:id/add-performance-grade', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const performanceGrade = req.body;
  const route = req.route.path;

  const requiredCheckPerformanceGrade = checkRequiredPerformanceGrade(performanceGrade);
  if (requiredCheckPerformanceGrade !== true) {
    return res.status(400).json({ errs: requiredCheckPerformanceGrade });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

    // Check if a performanceTest entry exists
    const assignedTest = await StudentAssignedPerformanceTest.findByPk(performanceGrade.assignedPerformanceTestId);

    if (!assignedTest) {
      return res.status(404).json({ errs: 'Performance test not found' });
    }

    const existingGrade = await StudentPerformanceGrade.findOne({
      where: { assignedPerformanceTestId: performanceGrade.assignedPerformanceTestId }
    });

    if (existingGrade) {
      return res.status(400).json({ errs: 'A grade has already been recorded for this assigned performance test' });
    }

    // Create a new performanceTest entry
    const newPerformanceGrade = await StudentPerformanceGrade.create(performanceGrade);
    res.status(201).json(newPerformanceGrade);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

//edit performance grade
router.patch('/students/:id/edit-performance-grade/:gradeId', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const grade_id = req.params.gradeId;
  const performanceGrade = req.body;
  const route = req.route.path;
  
  const requiredCheckPerformanceGrade = checkRequiredPerformanceGrade(performanceGrade);
  if (requiredCheckPerformanceGrade !== true) {
    return res.status(400).json({ errs: requiredCheckPerformanceGrade });
  }

  try {
    const student = await findUserByIdWithInclude(student_id, route);

    // Check if a performanceTest entry exists
    const assignedTest = await StudentAssignedPerformanceTest.findByPk(performanceGrade.assignedPerformanceTestId);

    if (!assignedTest) {
      return res.status(404).json({ errs: 'Performance test not found' });
    }

    const existingGrade = await StudentPerformanceGrade.findByPk(grade_id);

    if (!existingGrade) {
      return res.status(404).json({ errs: 'Grade not found' });
    }

    // Update the existing performanceGrade entry with the new data
    const updatedPerformanceGrade = await existingGrade.update(performanceGrade);
    res.status(200).json(updatedPerformanceGrade);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});



//delete performance grade
router.delete('/students/:id/delete-performance-grade/:gradeId', checkStudentId, async (req, res) => {
  const student_id = req.params.id;
  const grade_id = req.params.gradeId;
  const route = req.route.path;

  try {
    const student = await findUserByIdWithInclude(student_id, route);
    
    const grade = await StudentPerformanceGrade.findByPk(grade_id);

    if (!grade) {
      return res.status(404).json({ errs: 'Grade not found' });
    }

    await grade.destroy();
    res.status(200).json({ message: 'Grade deleted' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ errs: err.message || 'Internal Server Error' });

  }
});

//delete performance test and associated grade
router.delete('/students/:id/delete-performance-test/:testId', checkStudentId, async (req, res) => {
  const test_id = req.params.testId;

  try {
    const test = await StudentAssignedPerformanceTest.findByPk(test_id);

    if (!test) {
      return res.status(404).json({ errs: 'Test not found' });
    }

    await test.destroy();
    res.status(200).json({ message: 'Test deleted' });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ errs: 'Server error' });
  }
});

// Update a student
router.patch('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { password, studentDetails } = req.body;

  if (!id) return res.status(400).json({ errs: 'Student ID is required' });

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
      console.log('Student not found');
      return res.status(404).json({ errs: 'Student not found' });
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
    await student.update(updateFields, { transaction });

    if (student.studentDetails && studentDetails) { // Ensure studentDetails from req.body is also not undefined.
      const studentDetailUpdates = {
        gradYear: studentDetails.gradYear || student.studentDetails.gradYear // Fixed semicolon here.
      };
      await student.studentDetails.update(studentDetailUpdates, { transaction });
    } else {
      await transaction.rollback();
      console.log('Student details not found');
      return res.status(404).json({ errs: 'Student details not found' });
    }

    // Return the updated student with associated details.
    res.status(200).json(student);

  } catch (err) {
    console.log(err);
    res.status(500).json({ errs: 'Internal Server Error' });
  }
});

module.exports = router;
