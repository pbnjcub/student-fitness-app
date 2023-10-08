const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');  // Ensure you import the sequelize instance.
const { User, AdminDetail } = require('../models');
const bcrypt = require('bcrypt'); // Ensure you've imported bcrypt.

// Retrieve all admin users
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        userType: 'admin'
      },
      include: [{
        model: AdminDetail,
        as: 'adminDetails'
      }]
    });

    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).send('Server error');
  }
});

// Other admin-specific routes can go here...
router.patch('/admins/:id', async (req, res) => {
  const { id } = req.params;

  console.log(`Starting PATCH /admins/${id}...`);
  console.log(`Received request body:`, req.body);

  if (!id) return res.status(400).json({ error: 'Admin ID is required' });

  try {
    const transaction = await sequelize.transaction();

    const admin = await User.findByPk(id, {
      include: [{
        model: AdminDetail,
        as: 'adminDetails'
      }]
    }, { transaction });

    if (!admin) {
      await transaction.rollback();
      console.log(`Admin with ID ${id} not found.`);
      return res.status(404).json({ error: 'Admin not found' });
    }

    console.log(`Found admin:`, admin.toJSON());

    const updateFields = {
      email: req.body.email || admin.email,
      password: req.body.password ? await bcrypt.hash(req.body.password, 10) : admin.password,
      firstName: req.body.firstName || admin.firstName,
      lastName: req.body.lastName || admin.lastName,
      birthDate: req.body.birthDate || admin.birthDate,
      userType: req.body.userType || admin.userType,
      genderIdentity: req.body.genderIdentity || admin.genderIdentity,
      pronouns: req.body.pronouns || admin.pronouns
    };

    console.log(`Updating admin with:`, updateFields);
    await admin.update(updateFields, { transaction });

    if (admin.adminDetails) {
      const adminDetailUpdates = {
        yearsExp: req.body.adminDetails.yearsExp || admin.adminDetails.yearsExp,
        bio: req.body.adminDetails.bio || admin.adminDetails.bio
      };
      console.log(`Updating admin details with:`, adminDetailUpdates);
      await admin.adminDetails.update(adminDetailUpdates, { transaction });
    } else {
      await transaction.rollback();
      console.log('Admin details missing for the specified admin.');
      return res.status(400).json({ error: 'Admin details missing for the specified admin' });
    }

    await transaction.commit();
    console.log('Transaction committed.');

    res.status(200).json(admin);

  } catch (error) {
    console.error('Error in updating admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
