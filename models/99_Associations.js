console.log("Entering the associations file.");
const Sequelize = require('sequelize');

// Rest of the code ...


module.exports = (db) => {
  console.log("Contents of the db object:", Object.keys(db));
  
  console.log("Setting up User-StudentDetail association.");
  db.User.hasOne(db.StudentDetail, {
    foreignKey: 'userId',
    as: 'studentDetails'
  });
  db.StudentDetail.belongsTo(db.User, {
    foreignKey: 'userId'
  });

  console.log("Setting up User-StudentAnthro association.");
  db.User.hasOne(db.StudentAnthro, {
    foreignKey: 'studentUserId',
    as: 'studentAnthro'
  });
  db.StudentAnthro.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  console.log("Setting up User-StudentHistAnthro association.");
  db.User.hasMany(db.StudentHistAnthro, {
    foreignKey: 'studentUserId',
    as: 'studentHistAnthro'
  });
  db.StudentHistAnthro.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  console.log("Setting up User-StudentAssignedPerformanceTest association.");
  db.User.hasMany(db.StudentAssignedPerformanceTest, {
    foreignKey: 'studentUserId',
    as: 'studentAssignedPerformanceTest'
  });
  db.StudentAssignedPerformanceTest.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  console.log("Setting up User-StudentPerformanceGrade association.");
  db.User.hasMany(db.StudentPerformanceGrade, {
    foreignKey: 'studentUserId',
    as: 'studentPerformanceGrade'
  });
  db.StudentPerformanceGrade.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  console.log("Setting up User-StudentPerformanceGradeHistory association.");
  db.User.hasMany(db.StudentPerformanceGradesHistory, {
    foreignKey: 'studentUserId',
    as: 'studentPerformanceGradesHistory'
  });
  db.StudentPerformanceGradesHistory.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  console.log("Setting up User-TeacherDetail association.");
  db.User.hasOne(db.TeacherDetail, {
    foreignKey: 'userId',
    as: 'teacherDetails'
  });
  db.TeacherDetail.belongsTo(db.User, {
    foreignKey: 'userId'
  });

  console.log("Setting up User-StudentAssignedPerformanceTest for teachers association.");
  db.User.hasMany(db.StudentAssignedPerformanceTest, {
    foreignKey: 'teacherUserId',
    as: 'teacherAssignedPerformanceTest'
  });
  db.StudentAssignedPerformanceTest.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  console.log("Setting up User-StudentAnthro for teachers association.");
  db.User.hasMany(db.StudentAnthro, {
    foreignKey: 'teacherUserId',
    as: 'teacherAnthro'
  });
  db.StudentAnthro.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  console.log("Setting up User-StudentHistAnthro for teachers association.");
  db.User.hasMany(db.StudentHistAnthro, {
    foreignKey: 'teacherUserId',
    as: 'teacherHistAnthro'
  });
  db.StudentHistAnthro.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  console.log("Setting up User-StudentPerformanceGrade for teachers association.");
  db.User.hasMany(db.StudentPerformanceGrade, {
    foreignKey: 'teacherUserId',
    as: 'teacherPerformanceGrade'
  });
  db.StudentPerformanceGrade.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  console.log("Setting up User-StudentPerformanceGradesHistory for teachers association.");
  db.User.hasMany(db.StudentPerformanceGradesHistory, {
    foreignKey: 'teacherUserId',
    as: 'teacherPerformanceGradesHistory'
  });
  db.StudentPerformanceGradesHistory.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  console.log("Setting up User-AdminDetail association.");
  db.User.hasOne(db.AdminDetail, {
    foreignKey: 'userId',
    as: 'adminDetails'
  });
  db.AdminDetail.belongsTo(db.User, {
    foreignKey: 'userId'
  });

  console.log("Setting up StudentPerformanceType-StudentPerformanceGrade association.");
  db.StudentPerformanceType.hasMany(db.StudentPerformanceGrade, {
    foreignKey: 'studentPerformanceTypeId',
    as: 'studentPerformanceGrade'
  });
  db.StudentPerformanceGrade.belongsTo(db.StudentPerformanceType, {
    foreignKey: 'studentPerformanceTypeId'
  });

  console.log("Setting up StudentPerformanceType-StudentPerformanceGradeHistory association.");
  db.StudentPerformanceType.hasMany(db.StudentPerformanceGradesHistory, {
    foreignKey: 'studentPerformanceTypeId',
    as: 'studentPerformanceGradeHistory'
  });
  db.StudentPerformanceGradesHistory.belongsTo(db.StudentPerformanceType, {
    foreignKey: 'studentPerformanceTypeId'
  });

  console.log("Setting up StudentPerformanceType-StudentAssignedPerformanceTest association.");
  db.StudentPerformanceType.hasMany(db.StudentAssignedPerformanceTest, {
    foreignKey: 'performanceTypeId',
    as: 'studentAssignedPerformanceTest'
  });
  db.StudentAssignedPerformanceTest.belongsTo(db.StudentPerformanceType, {
    foreignKey: 'performanceTypeId'
  });
};
