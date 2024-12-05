// index.js
// application main entry point. initializes server

// import 'app' module (app.js)
const app = require('./app');

// app listens for traffic on port 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});