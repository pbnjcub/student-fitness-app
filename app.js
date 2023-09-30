const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors module
const app = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = 3000;

const studentRoutes = require('./routes/studentRoutes');

// Setup CORS Middleware
const corsOptions = {
  origin: 'http://localhost:8081', // Replace with your frontend application's address
  credentials: true,
  methods: 'GET,POST,PUT,DELETE',
};
app.use(cors(corsOptions)); // Apply CORS with the options 

app.use(jsonParser);

app.use('/api', studentRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the Backend!');
});

app.listen(port, () => {
  console.log(`Backend is listening at http://localhost:${port}`);
});
