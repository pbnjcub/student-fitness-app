const express = require('express');
const router = express.Router();
const { User, AdminDetail } = require('../models');

// Helper function to format admin data
const formatAdminData = (admin) => {
  const { id, email, lastName, firstName, birthDate, genderIdentity, pronouns, userType, adminDetails } = admin;

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
    adminDetails 
  };
};


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

    const modifiedAdmins = admins.map(admin => formatAdminData(admin));

    res.json(modifiedAdmins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).send('Server error');
  }
});

// Other student-specific routes can go here...
router.patch('/admins/:id', async (req, res) => {
  const { id } = req.params; // Extracting admin ID from the route parameter.
  const { email, password, firstName, lastName, birthDate, yearsExp, bio } = req.body; // Extracting fields from the request body.

  if (!id) return res.status(400).json({ error: 'admin ID is required' });

  try {
    // Find the admin by ID and include the associated adminDetail.
    const admin = await User.findByPk(id, {
      include: [{
        model: AdminDetail,
        as: 'adminDetails'
      }]
    });

    if (!admin) return res.status(404).json({ error: 'admin not found' });

    // Update the admin's fields if they are provided.
    if (email) admin.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Ensure you've imported bcrypt at the top of your file.
      admin.password = hashedPassword;
    }
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (birthDate) admin.birthDate = birthDate;

    // Update fields in the associated StudentDetail.
    if (admin.adminDetails) {
      if (yearsExp) admin.adminDetails.yearsExp = yearsExp;
      if (bio) admin.adminDetails.bio = bio;
      await admin.adminDetails.save();
    }

    // Save the updated admin object.
    await admin.save();

    const formattedAdmin = formatAdminData(admin);

    // Return the updated admin with associated details.
    res.status(200).json(formattedAdmin);

  } catch (error) {
    console.error('Error in updating admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
