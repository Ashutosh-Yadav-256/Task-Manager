const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
if (uri && process.env.NODE_ENV !== 'test') {
    mongoose.connect(uri);
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    });
}

const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');
const { memoryRouter } = require('./inMemoryStore');

if (!uri && process.env.NODE_ENV !== 'test') {
    console.log("Notice: MONGO_URI is not set. Running with built-in in-memory demo store.");
    app.use(memoryRouter);
} else {
    app.use('/tasks', tasksRouter);
    app.use('/users', usersRouter);
}

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

module.exports = app;

