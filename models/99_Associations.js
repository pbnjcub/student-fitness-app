console.log("Entering the associations file.");
const Sequelize = require('sequelize');

// Rest of the code ...


module.exports = (db) => {
  console.log("Contents of the db object:", Object.keys(db));
  
  //student associations
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

  db.User.hasMany(db.StudentAssignedPerformanceTestHistory, {
    foreignKey: 'studentUserId',
    as: 'studentAssignedPerformanceTestHistory'
  });
  db.StudentAssignedPerformanceTestHistory.belongsTo(db.User, {
    foreignKey: 'studentUserId'
  });

  //teacher associations
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

  console.log("Setting up User-StudentAssignedPerformanceTest association.");
  db.User.hasMany(db.StudentAssignedPerformanceTestHistory, {
    foreignKey: 'teacherUserId',
    as: 'teacherAssignedPerformanceTestHistory'
  });
  db.StudentAssignedPerformanceTestHistory.belongsTo(db.User, {
    foreignKey: 'teacherUserId'
  });

  //admin associations
  console.log("Setting up User-AdminDetail association.");
  db.User.hasOne(db.AdminDetail, {
    foreignKey: 'userId',
    as: 'adminDetails'
  });
  db.AdminDetail.belongsTo(db.User, {
    foreignKey: 'userId'
  });

  //student performance type associations
  console.log("Setting up StudentPerformanceType-StudentAssignedPerformanceTest association.");
  db.StudentPerformanceType.hasMany(db.StudentAssignedPerformanceTest, {
    foreignKey: 'performanceTypeId',
    as: 'performanceTypeAssignedPerformanceTest'
  });
  db.StudentAssignedPerformanceTest.belongsTo(db.StudentPerformanceType, {
    foreignKey: 'performanceTypeId'
  });
 
  console.log("Setting up StudentPerformanceType-StudentAssignedPerformanceTestHistory association.");
  db.StudentPerformanceType.hasMany(db.StudentAssignedPerformanceTestHistory, {
    foreignKey: 'performanceTypeId',
    as: 'performanceTypeAssignedPerformanceTestHistory'
  });
  db.StudentAssignedPerformanceTestHistory.belongsTo(db.StudentPerformanceType, {
    foreignKey: 'performanceTypeId'
  });

  //assigned performance test associations
  console.log("Setting up StudentAssignedPerformanceTest-studentPerformanceGrade association.");
  db.StudentAssignedPerformanceTest.hasOne(db.StudentPerformanceGrade, {
    foreignKey: 'assignedPerformanceTestId',
    as: 'assignedPerformanceGrade'
  });
  db.StudentPerformanceGrade.belongsTo(db.StudentAssignedPerformanceTest, {
    foreignKey: 'assignedPerformanceTestId'
  });

  //assigned performance test history associations
  console.log("Setting up StudentAssignedPerformanceTestHistory-studentPerformanceGradeHistory association.");
  // In the associations file
  db.StudentAssignedPerformanceTestHistory.hasOne(db.StudentPerformanceGradesHistory, {
    foreignKey: 'assignedPerformanceTestId',
    targetKey: 'originalAssignedPerformanceTestId',
    as: 'assignedPerformanceGradeHistory'
  });
  db.StudentPerformanceGradesHistory.belongsTo(db.StudentAssignedPerformanceTestHistory, {
    foreignKey: 'assignedPerformanceTestId',
    targetKey: 'originalAssignedPerformanceTestId',
    as: 'assignedTestHistory'
  });

};
