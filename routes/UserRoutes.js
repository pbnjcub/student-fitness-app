const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize } = require('../models');
const Papa = require('papaparse');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//helper functions
async function createUser(userData, transaction = null) {
  console.log("createUser function hit")
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
      ...userData,
      password: hashedPassword
  }, { transaction });
  console.log("user", user)

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
  }

  return user;
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function updateUserDetails(user, userData, transaction) {
  switch (user.userType) {
      case 'student':
          await user.getStudentDetails({ transaction }).then(details => details.update(userData, { transaction }));
          break;
      case 'teacher':
          await user.getTeacherDetails({ transaction }).then(details => details.update(userData, { transaction }));
          break;
      case 'admin':
          await user.getAdminDetails({ transaction }).then(details => details.update(userData, { transaction }));
          break;
  }
}

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


//routes
router.post('/register', async (req, res) => {
  const { email, password, lastName, firstName, birthDate, genderIdentity, pronouns, photoUrl, userType, isArchived, dateArchived, gradYear, yearsExp, bio } = req.body;

  if (!email || !password || !lastName || !firstName || !birthDate || !userType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await createUser(req.body);
    res.status(201).json(userDTO(user));
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
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
        }, 
        {
          model: AdminDetail,
          as: 'adminDetails',
          required: false
        }
      ]
    });

    const detailedUsers = users.map(user => {
      const mainUserData = userDTO(user);
      let userDetails = {};

      if (user.userType === 'student') {
        userDetails = {
          ...user.studentDetails ? user.studentDetails.toJSON() : null,
          ...user.studentAnthro ? user.studentAnthro.toJSON() : null
        };
      } else if (user.userType === 'teacher') {
        userDetails = {
          ...user.teacherDetails ? user.teacherDetails.toJSON() : null
        };
      } else if (user.userType === 'admin') {
        userDetails = {
          ...user.adminDetails ? user.adminDetails.toJSON() : null
        };
      }

      return {
        ...mainUserData,
        details: userDetails
      };
    });

    res.json(detailedUsers);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// router.post('/users/upload', upload.single('file'), async (req, res) => {
//   console.log("upload route hit");
//   let transaction = null;  // Initialize transaction with null
//   try {
//       const buffer = req.file.buffer;
//       const content = buffer.toString();
//       console.log("content", content);

//       const results = await new Promise((resolve, reject) => {
//           Papa.parse(content, {
//               header: true,
//               dynamicTyping: true,
//               complete: resolve,
//               error: reject
//           });
//       });

//       console.log("results", results);
//       transaction = await sequelize.transaction();  // Set the transaction here
//       console.log("Transaction state:", transaction.finished);

//       // ... (rest of your code)

//       await transaction.commit();
//       res.status(200).json({ success: 'File uploaded and processed successfully', newUsers });

//   } catch (error) {
//       if (transaction) {
//           await transaction.rollback();
//       }
//       console.error('Error:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



router.post('/users/upload', upload.single('file'), async (req, res) => {
  console.log("upload route hit")
  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    console.log("content", content);  
    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        console.log("results", results);
        const transaction = await sequelize.transaction();
        console.log("Transaction state:", transaction.finished);

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
              newUsers.push(userDTO(user));

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
              }
            }
          }

          await transaction.commit();
          res.status(200).json({ success: 'File uploaded and processed successfully', newUsers });

        } catch (error) {
          await transaction.rollback();
          res.status(500).json({ error: 'Internal Server Error' });
          console.error('Error:', error.message)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error('Error:', error.message)
  }
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const {
      email, password, lastName, firstName, birthDate, genderIdentity,
      pronouns, photoUrl, userType, isArchived, dateArchived, gradYear, yearsExp, bio
  } = req.body;

  try {
      const user = await User.findByPk(id);

      if (!user) {
          return res.status(404).json({ error: `User with ID ${id} not found` });
      }

      // Prepare an object to hold the updated values
      const updatedValues = {};
      if (email !== user.email) updatedValues.email = email;
      if (password && password !== user.password) updatedValues.password = await hashPassword(password);
      if (lastName !== user.lastName) updatedValues.lastName = lastName;
      if (firstName !== user.firstName) updatedValues.firstName = firstName;
      if (birthDate !== user.birthDate) updatedValues.birthDate = birthDate;
      if (genderIdentity !== user.genderIdentity) updatedValues.genderIdentity = genderIdentity;
      if (pronouns !== user.pronouns) updatedValues.pronouns = pronouns;
      if (photoUrl !== user.photoUrl) updatedValues.photoUrl = photoUrl;
      if (userType !== user.userType) updatedValues.userType = userType;
      if (isArchived !== user.isArchived) updatedValues.isArchived = isArchived;
      if (dateArchived !== user.dateArchived) updatedValues.dateArchived = dateArchived;

      await user.update(updatedValues);

      let userDetails = {};
      switch (userType) {
          case 'student':
              userDetails = await user.getStudentDetails();
              if (gradYear !== userDetails.gradYear) {
                  await userDetails.update({ gradYear });
              }
              break;
          case 'teacher':
              userDetails = await user.getTeacherDetails();
              if (yearsExp !== userDetails.yearsExp || bio !== userDetails.bio) {
                  await userDetails.update({ yearsExp, bio });
              }
              break;
          case 'admin':
              userDetails = await user.getAdminDetails();
              // You can add conditions here if admin has specific fields
              break;
      }

      res.status(200).json({
          ...userDTO(user),
          details: userDetails
      });
  } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/users/bulk-edit', upload.single('file'), (req, res, next) => {
  if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
  }
  next();
}, async (req, res) => {
  try {
      const buffer = req.file.buffer;
      const content = buffer.toString();

      let editedUsers = [];

      Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          complete: async (results) => {
              const transaction = await sequelize.transaction();
              try {
                  for (const userData of results.data) {
                      userData.id = parseInt(userData.id);
                      if (isNaN(userData.id)) {
                          throw new Error(`Invalid ID ${userData.id} provided in CSV`);
                      }

                      const user = await User.findByPk(userData.id, { transaction });
                      if (!user) {
                          throw new Error(`User with ID ${userData.id} not found`);
                      }

                      if (userData.password) {
                          userData.password = await bcrypt.hash(userData.password, 10);
                      }

                      // Remove unchanged fields
                      for (const key in userData) {
                          if (userData[key] === null || userData[key] === user[key]) {
                              delete userData[key];
                          }
                      }

                      await user.update(userData, { transaction });

                      let userDetails = {};
                      switch (user.userType) {
                          case 'student':
                              userDetails = await user.getStudentDetails({ transaction });
                              if (userData.gradYear !== userDetails.gradYear) {
                                  await userDetails.update({ gradYear }, { transaction });
                              }
                              break;
                          case 'teacher':
                              userDetails = await user.getTeacherDetails({ transaction });
                              if (userData.yearsExp !== userDetails.yearsExp || userData.bio !== userDetails.bio) {
                                  await userDetails.update({ yearsExp: userData.yearsExp, bio: userData.bio }, { transaction });
                              }
                              break;
                          case 'admin':
                              userDetails = await user.getAdminDetails({ transaction });
                              // You can add conditions here if admin has specific fields
                              break;
                      }

                      editedUsers.push({
                          ...userDTO(user),
                          details: userDetails
                      });
                  }
                  await transaction.commit();
                  res.status(200).json({ success: 'File processed successfully', editedUsers });
              } catch (err) {
                  await transaction.rollback();
                  res.status(500).json({ error: err.message });
              }
          }
      });
  } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
