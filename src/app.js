// app.js
// configures application

// import express modules
const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

// create express application
const app = express();

// use routes (src/routes)
app.use('/user', userRoutes);
app.use('/product', productRoutes);

// route for index.html (home page)
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// expose `public` folder (css, media)
app.use(express.static(path.join(__dirname, '../public')));

// export 'app'
module.exports = app;