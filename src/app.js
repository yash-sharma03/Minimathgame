// app.js
// handle Express application (routes, middleware)

// import express modules
const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');

// create express application
const app = express();

// import database setup (db.js)
const db = require('./db')

// express uses `public` directory as ROOT for static files (css, media)
app.use(express.static(path.join(__dirname, '../public')));

// route for index.html (home page)
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// route for login.html
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// use routes (src/routes)
app.use('/user', userRoutes);
app.use('/item', itemRoutes);

// handle invalid requests
app.use((req, res, next) => {
    res.status(404).send('invalid request');
})



// export 'app'
module.exports = app;