const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config.cjs')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);
console.log("Sequelize initialized")
const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js' && file !== '05_Associations.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`Model ${model.name} initialized`)
  });

// Now that all models are loaded, set up the associations:
require('./05_Associations')(db);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`Model ${modelName} associated`)
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("All models loaded and associated")
module.exports = db;
