const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize } = require('../models');
const Papa = require('papaparse');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', async (req, res) => {
  const { email, password, lastName, firstName, birthDate, userType } = req.body;

  if (!email || !password || !lastName || !firstName || !birthDate || !userType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      lastName,
      firstName,
      birthDate,
      genderIdentity,
      pronouns,
      userType,
      photoUrl
    });

    switch (userType) {
      case 'student':
        await StudentDetail.create({
          userId: user.id,
          gradYear: gradYear || null
        });
        break;

      case 'teacher':
        await TeacherDetail.create({
          userId: user.id,
          yearsExp: yearsExp || null,
          bio: bio || null
        });
        break;

      case 'admin':
        await AdminDetail.create({
          userId: user.id,
          yearsExp: yearsExp || null,
          bio: bio || null
        });
        break;
    }

    res.status(201).json(user);
  } catch (err) {
    console.error('Error when registering user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: StudentDetail,
        as: 'studentDetails',
        required: false
      },
      {
        model: StudentAnthro,
        as: 'studentAnthro',
        required: false
      },
      {
        model: TeacherDetail,
        as: 'teacherDetails',
        required: false
      }, {
        model: AdminDetail,
        as: 'adminDetails',
        required: false
      }]
    });

    const modifiedUsers = users.map(user => {
      const { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, photoUrl, studentDetails, studentAnthro, teacherDetails, adminDetails } = user;

      let details = {};
      switch (userType) {
        case 'student':
          if (studentDetails) {
            details = { ...studentDetails.toJSON(), ...studentAnthro ? studentAnthro.toJSON() : {} };
          }
          break;
        case 'teacher':
          if (teacherDetails) {
            const { yearsExp, bio } = teacherDetails; 
            details = { yearsExp, bio };
          }
          break;
        case 'admin':
          if (adminDetails) {
            const { yearsExp, bio } = adminDetails;
            details = { yearsExp, bio };
          }
          break;
      }

      return { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, photoUrl, ...details };
    });

    res.json(modifiedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        const transaction = await sequelize.transaction();

        try {
          const newUsers = [];

          for (const userData of results.data) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const [user, created] = await User.findOrCreate({
              where: { email: userData.email },
              defaults: {
                ...userData,
                password: hashedPassword
              },
              transaction
            });

            if (created) {
              newUsers.push(user);

              switch (userData.userType) {
                case 'student':
                  await StudentDetail.create({
                    userId: user.id,
                    gradYear: userData.gradYear || null
                  }, { transaction });
                  break;

                case 'teacher':
                  await TeacherDetail.create({
                    userId: user.id,
                    yearsExp: userData.yearsExp || null,
                    bio: userData.bio || null
                  }, { transaction });
                  break;

                case 'admin':
                  await AdminDetail.create({
                    userId: user.id,
                    yearsExp: userData.yearsExp || null,
                    bio: userData.bio || null
                  }, { transaction });
                  break;

                default:
                  throw new Error('Invalid userType');
              }
            }
          }

          await transaction.commit();
          res.status(200).json({ success: 'File uploaded and processed successfully', newUsers });

        } catch (error) {
          await transaction.rollback();
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      },
    });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
