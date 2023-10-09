const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { User, TeacherDetail } = require('../models');

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

    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).send('Server error');
  }
});

// Other teacher-specific routes can go here...

router.patch('/teachers/:id', async (req, res) => {
  const { id } = req.params;

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
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const updateFields = {
      email: req.body.email || teacher.email,
      password: req.body.password ? await bcrypt.hash(password, 10) : teacher.password,
      firstName: req.body.firstName || teacher.firstName,
      lastName: req.body.lastName || teacher.lastName,
      birthDate: req.body.birthDate || teacher.birthDate,
      userType: req.body.userType || teacher.userType,
      genderIdentity: req.body.genderIdentity || teacher.genderIdentity,
      pronouns: req.body.pronouns || teacher.pronouns,
      photoUrl: req.body.photoUrl || teacher.photoUrl
    };

    await teacher.update(updateFields, { transaction });

    if (teacher.teacherDetails) {
      const teacherDetailUpdates = {
        yearsExp: req.body.teacherDetails.yearsExp || teacher.teacherDetails.yearsExp,
        bio: req.body.teacherDetails.bio || teacher.teacherDetails.bio
      };
      await teacher.teacherDetails.update(teacherDetailUpdates, { transaction });
    } else {
      await transaction.rollback();
      return res.status(400).json({ error: 'Teacher details missing for the specified teacher' });
    }

    await transaction.commit();

    res.status(200).json(teacher);

  } catch (error) {
    console.error('Error in updating teacher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
