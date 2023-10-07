const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors module
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = 3000;


const userRoutes = require('./routes/UserRoutes');
const studentRoutes = require('./routes/StudentRoutes');
const teacherRoutes = require('./routes/TeacherRoutes');
const sessionsRoutes = require('./routes/SessionsRoutes');

//Import models and setup associations
const db = require('./models');
require('./models/05_Associations');

// Setup CORS Middleware
const corsOptions = {
  origin: 'http://localhost:8081', // Replace with your frontend application's address
  credentials: true,
  methods: 'GET,POST,PATCH,PUT,DELETE',
};
app.use(cors(corsOptions)); // Apply CORS with the options 

app.use(jsonParser);
app.use(urlencodedParser)
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));


app.use('/api', userRoutes);
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);
app.use('/api', sessionsRoutes);


app.get('/', (req, res) => {
  res.send('Hello from the Backend!');
});

// Optional: Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

if (process.env.NODE_ENV !== 'production') {
  db.sequelize.sync()
    .then(() => {
      app.listen(port, () => {
        console.log(`Backend is listening at http://localhost:${port}`);
      });
    })
    .catch(err => {
      console.error('Error syncing database:', err);
    });
} else {
  app.listen(port, () => {
    console.log(`Backend is listening at http://localhost:${port}`);
  });
}

