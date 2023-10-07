const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');  // Ensure you import the sequelize instance.
const { User, TeacherDetail } = require('../models');

// Helper function to format teacher data
const formatTeacherData = (teacher) => {
  const { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, teacherDetails } = teacher;

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
    teacherDetails 
  };
};


// Retrieve all teacher users
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: {
        userType: 'teacher'
      },
      include: [{
        model: TeacherDetail,
        as: 'teacherDetails'
      }]
    });

    const modifiedTeachers = teachers.map(teacher => formatTeacherData(teacher));

    res.json(modifiedTeachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).send('Server error');
  }
});

// Other teacher-specific routes can go here...

router.patch('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, firstName, lastName, birthDate, yearsExp, bio } = req.body;

  console.log(`Starting PATCH /teachers/${id}...`);
  console.log(`Received request body:`, req.body);


  if (!id) return res.status(400).json({ error: 'Teacher ID is required' });

  try {
    const transaction = await sequelize.transaction();

    const teacher = await User.findByPk(id, {
      include: [{
        model: TeacherDetail,
        as: 'teacherDetails'
      }]
    }, { transaction });

    if (!teacher) {
      await transaction.rollback();
      console.log(`Teacher with ID ${id} not found.`);
      return res.status(404).json({ error: 'Teacher not found' });
    }

    console.log(`Found teacher:`, teacher.toJSON());

    const updateFields = {
      email: req.body.email || teacher.email,
      password: req.body.password ? await bcrypt.hash(password, 10) : teacher.password,
      firstName: req.body.firstName || teacher.firstName,
      lastName: req.body.lastName || teacher.lastName,
      birthDate: req.body.birthDate || teacher.birthDate,
      userType: req.body.userType || teacher.userType,
      genderIdentity: req.body.genderIdentity || teacher.genderIdentity,
      pronouns: req.body.pronouns || teacher.pronouns
    };

    console.log(`Updating teacher with:`, updateFields);
    await teacher.update(updateFields, { transaction });

    if (teacher.teacherDetails) {
      const teacherDetailUpdates = {
        yearsExp: req.body.teacherDetails.yearsExp || teacher.teacherDetails.yearsExp,
        bio: req.body.teacherDetails.bio || teacher.teacherDetails.bio
      };
      console.log(`Updating teacher details with:`, teacherDetailUpdates);
      await teacher.teacherDetails.update(teacherDetailUpdates, { transaction });
    } else {
      await transaction.rollback();
      console.log('Teacher details missing for the specified teacher.');
      return res.status(400).json({ error: 'Teacher details missing for the specified teacher' });
    }

    await transaction.commit();
    console.log('Transaction committed.');

    const formattedTeacher = formatTeacherData(teacher);
    console.log('Formatted teacher for response:', formattedTeacher);
    res.status(200).json(formattedTeacher);

  } catch (error) {
    console.error('Error in updating teacher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
