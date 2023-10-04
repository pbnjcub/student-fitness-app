module.exports = (models) => {
    models.User.hasOne(models.StudentDetail, {
      foreignKey: 'userId',
      as: 'studentDetails'
    });
    models.User.hasOne(models.TeacherDetail, {
      foreignKey: 'userId',
      as: 'teacherDetails'
    });
    models.User.hasOne(models.AdminDetail, {
      foreignKey: 'userId',
      as: 'adminDetails'
    });
  
    models.StudentDetail.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    models.TeacherDetail.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    models.AdminDetail.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    
    // ... other associations for other models
  };
  