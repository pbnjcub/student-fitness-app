const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { User, StudentDetail, TeacherDetail, AdminDetail, sequelize } = require('../models'); // Import sequelize instance along with Student Model
const Papa = require('papaparse');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', async (req, res) => {
  const { email, password, lastName, firstName, birthDate, userType } = req.body;

  if (!email || !password || !lastName || !firstName || birthDate || !userType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      lastName,
      firstName,
      birthDate,
      genderIdentity,
      pronouns,
      userType
    });

    // Add additional details based on userType
    switch (userType) {
      case 'student':
        if (!gradYear) {
          return res.status(400).json({ error: 'gradYear is required for students' });
        }
        await StudentDetail.create({
          userId: user.id,
          gradYear
        });
        break;

      case 'teacher':
        if (!yearsExp || !bio) {
          return res.status(400).json({ error: 'yearsExp and bio are required for teachers' });
        }
        await TeacherDetail.create({
          userId: user.id,
          yearsExp,
          bio
        });
        break;

      case 'admin':
        if (!yearsExp || !bio) {
          return res.status(400).json({ error: 'yearsExp and bio are required for admins' });
        }
        await AdminDetail.create({
          userId: user.id,
          yearsExp,
          bio
        });
        break;

      default:
        // Handle unrecognized userType or just let it pass
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
        required: false // This ensures that even users without studentDetails are returned
      }, {
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
      const { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, createdAt, updatedAt, studentDetails, teacherDetails, adminDetails } = user;

      let details = {};
      switch (userType) {
        case 'student':
          if (studentDetails) {
            details.gradYear = studentDetails.gradYear;
          }
          break;
        case 'teacher':
          if (teacherDetails) {
            details.yearsExp = teacherDetails.yearsExp;
            details.bio = teacherDetails.bio;
          }
          break;
        case 'admin':
          if (adminDetails) {
            details.yearsExp = adminDetails.yearsExp;
            details.bio = adminDetails.bio;
          }
          break;
      }

      return { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, ...details };
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
        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
          const newUsers = []; // Array to hold newly added users

          for (const userData of results.data) {

            //Hash password
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
              newUsers.push(user); // If user is new, add to newUsers array

              // Add additional details based on userType
              switch (userData.userType) {
                case 'student':
                  if (!userData.gradYear) {
                    throw new Error('gradYear is required for students');
                  }
                  await StudentDetail.create({
                    userId: user.id,
                    gradYear: userData.gradYear
                  }, { transaction });
                  break;

                case 'teacher':
                  if (!userData.yearsExp || !userData.bio) {
                    throw new Error('yearsExp and bio are required for teachers');
                  }
                  await TeacherDetail.create({
                    userId: user.id,
                    yearsExp: userData.yearsExp,
                    bio: userData.bio
                  }, { transaction });
                  break;

                case 'admin':
                  if (!userData.yearsExp || !userData.bio) {
                    throw new Error('yearsExp and bio are required for admins');
                  }
                  await AdminDetail.create({
                    userId: user.id,
                    yearsExp: userData.yearsExp,
                    bio: userData.bio
                  }, { transaction });
                  break;

                default:
                  throw new Error('Invalid userType');
              }
            }
          }

          await transaction.commit();

          // Send newly added users as response
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

