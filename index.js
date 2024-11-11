// import express
const express = require('express');

// create express application
const app = express();

// define route for root URL ("/")
app.get('/', (req, res) => {
    res.send('Hello world!');
});

// server listens on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});