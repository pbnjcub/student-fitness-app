const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { User, StudentDetail, StudentAnthro, TeacherDetail, AdminDetail, sequelize } = require('../models');
const Papa = require('papaparse');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//helper functions

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

const checkRequired = (userData) => {
  const { email, password, lastName, firstName, birthDate, userType } = userData;

  const missingFields = [];
  
  if (!email) missingFields.push('Email');
  if (!password) missingFields.push('Password');
  if (!lastName) missingFields.push('Last name');
  if (!firstName) missingFields.push('First name');
  if (!birthDate) missingFields.push('Birth date');
  if (!userType) missingFields.push('User type');

  return missingFields.length > 0 ? missingFields.join(', ') + ' required.' : true;
}


async function createUser(userData, transaction = null) {

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const mainUserData = {
      email: userData.email,
      password: hashedPassword,
      lastName: userData.lastName,
      firstName: userData.firstName,
      birthDate: userData.birthDate,
      userType: userData.userType,
      photoUrl: userData.photoUrl,
      isArchived: userData.isArchived || false,
      dateArchived: userData.dateArchived || null
  };

  const [user, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: mainUserData,
      transaction
  });

  if (!created) {
      return null;
  }

  // Create user details
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
          throw new Error("Invalid user type");
  }

  return user;
}

async function detailedUser(newUser) {

  let userDetails = {};

  const user = await User.findByPk(newUser.id, {
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
  
  if (user && user.userType === 'student') {
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
      ...newUser,
      details: userDetails
  };
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




//routes
//create user
router.post('/users/register', async (req, res) => {
  try {
    const requiredCheck = checkRequired(req.body);
    if (requiredCheck !== true) {
      return res.status(400).json({ error: requiredCheck });
    }

    const user = await createUser(req.body);
    const mainUserData = userDTO(user);
    const userWithDetails = await detailedUser(mainUserData);

    return res.status(201).json(userWithDetails);

  } catch (err) {
    if (err.message === "User already exists.") {
      return res.status(409).json({ error: err.message });
    } else if (err.message === "Invalid user type") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




//get users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    const mainUsers = [];

    for (const user of users) {
      mainUsers.push(userDTO(user));
    }

    const detailedUsers = [];

    for (const user of mainUsers) {
      detailedUsers.push(await detailedUser(user));
    }
  
    res.json(detailedUsers);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//bulk upload
router.post('/users/upload', upload.single('file'), async (req, res) => {
  console.log("Bulk upload route triggered.");

  try {
    const buffer = req.file.buffer;
    const content = buffer.toString();

    const newUsers = [];
    const errors = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        const transaction = await sequelize.transaction();
        try {
          for (const userData of results.data) {
            const requiredCheck = checkRequired(userData);
            if (requiredCheck !== true) {
              errors.push({ userData, error: requiredCheck });
            } else {
              try {
                const newUser = await createUser(userData, transaction);
                if (!newUser) {
                  errors.push({ userData, error: `User with email ${userData.email} already exists` });
                } else {
                  newUsers.push(userDTO(newUser));
                }
              } catch (error) {
                errors.push({ userData, error: error.message });
              }
            }
          }
          if (errors.length > 0) {
            await transaction.rollback();
            res.status(400).json({ error: 'Some users could not be processed', details: errors });
          } else {
            await transaction.commit();
            res.status(200).json({ success: 'File uploaded and processed successfully', newUsers });
          }
        } catch (error) {
          await transaction.rollback(); // Rollback the transaction if there's an error
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//edit user by id
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
      if (email && email !== user.email) updatedValues.email = email;
      if (password) updatedValues.password = await hashPassword(password);
      if (lastName && lastName !== user.lastName) updatedValues.lastName = lastName;
      if (firstName && firstName !== user.firstName) updatedValues.firstName = firstName;
      if (birthDate && birthDate !== user.birthDate) updatedValues.birthDate = birthDate;
      if (genderIdentity && genderIdentity !== user.genderIdentity) updatedValues.genderIdentity = genderIdentity;
      if (pronouns && pronouns !== user.pronouns) updatedValues.pronouns = pronouns;
      if (photoUrl && photoUrl !== user.photoUrl) updatedValues.photoUrl = photoUrl;
      if (userType && userType !== user.userType) updatedValues.userType = userType;
      if (isArchived !== undefined && isArchived !== user.isArchived) updatedValues.isArchived = isArchived;
      if (dateArchived && dateArchived !== user.dateArchived) updatedValues.dateArchived = dateArchived;

      await user.update(updatedValues);

      let userDetails = {};
      switch (userType) {
          case 'student':
              userDetails = await user.getStudentDetails();
              if (gradYear && gradYear !== userDetails.gradYear) {
                  await userDetails.update({ gradYear });
              }
              break;
          case 'teacher':
              userDetails = await user.getTeacherDetails();
              if ((yearsExp && yearsExp !== userDetails.yearsExp) || (bio && bio !== userDetails.bio)) {
                  await userDetails.update({ yearsExp, bio });
              }
              break;
          case 'admin':
              userDetails = await user.getAdminDetails();
              if ((yearsExp && yearsExp !== userDetails.yearsExp) || (bio && bio !== userDetails.bio)) {
                await userDetails.update({ yearsExp, bio });
            }
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


//delete user by id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    await user.destroy();
    res.status(204).json("User successfully deleted");
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
