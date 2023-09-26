const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = 3000;

const studentRoutes = require('./routes/studentRoutes'); // Import the router using CommonJS syntax

app.use('/api', studentRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the Backend!');
});

app.listen(port, () => {
  console.log(`Backend is listening at http://localhost:${port}`);
});
