
module.exports = (db) => {
    // Associations for User and StudentDetail
    db.User.hasOne(db.StudentDetail, {
        foreignKey: 'userId',
        as: 'studentDetails'
      });
      db.StudentDetail.belongsTo(db.User, {
        foreignKey: 'userId'
      });
       // Associations for User and TeacherDetail
    db.User.hasOne(db.TeacherDetail, {
        foreignKey: 'userId',
        as: 'teacherDetails'
      });
      db.TeacherDetail.belongsTo(db.User, {
        foreignKey: 'userId'
      });
       // Associations for User and AdminDetail
    db.User.hasOne(db.AdminDetail, {
        foreignKey: 'userId',
        as: 'adminDetails'
      });
      db.AdminDetail.belongsTo(db.User, {
        foreignKey: 'userId'
      });
};


