// app.js
// handle Express application (routes, middleware)

// import express modules
const express = require('express');
const path = require('path');
const session = require('express-session');
// url routes
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
// import sqlite3: database setup (db.js)
const db = require('./db')
// import bcrypt: hashing password, user authentication
const bcrypt = require('bcrypt');

// create express application
const app = express();

// express: parse POST form data as key-value pairs in HTTP request body
app.use(express.urlencoded({ extended: true }));
// express: pass session data as JSON to webpages
app.use(express.json());
// express: app serves static assets (css/js/media) from /public
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// express-sessions: allow sessions to be created
/** @NOTE if deploying for production, replace the secret key */
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


/** protect certain routes by ensuring that user is authenticated */
function authenticate(req, res, next)
{
    if (req.session.user)
        return next(); // authenticated

    res.redirect('/login'); // redirect to login page
}

// route: signup.html
app.get('/signup', (req,res) => {
    if (req.session.user)
        res.redirect('/');

    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// route: signup.html AFTER FORM SUBMIT
app.post('/signup', (req,res) => {
    // retrieve form data
    const { username, password } = req.body;

    // ensure both username and password are included
    if (!username || !password)
        return res.status(400).send('Missing username or password');

    try
    {
        // new user cannot have same username as existing user
        const existingUser = db.prepare('SELECT UserName FROM User WHERE UserName == ?').get(username);

        if (existingUser)
            return res.status(401).send('User already exists');

        // hash provided password
        const saltRounds = 10; // bcrypt: hashing rounds
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        // insert user into database
        db.prepare('INSERT INTO User (UserName, UserPassword) VALUES (?,?)').run(username, hashedPassword);

        // query the user we just inserted
        const newUser = db.prepare('SELECT UserName FROM User WHERE UserName == ?').get(username);

        if (!newUser)
            return res.status(401).send('Failed to query new user');

        req.session.user = newUser.UserName;
        return res.status(201).send('User created');
    }
    catch (err)
    {
        console.error('Error /signup: ', err);
        return res.status(500).send('Internal server error');
    }
});

// route: login.html
// TODO redirect to home page if user already logged in
app.get('/login', (req,res) => {
    if (req.session.user)
        res.redirect('/');

    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// route: login.html AFTER FORM SUBMIT
app.post('/login', async (req,res) => {
    const { username, password } = req.body;

    // ensure both username and password are included
    if (!username || !password)
        return res.status(400).send('Missing username or password');

    try
    {
        // try to find user
        const user = db.prepare('SELECT UserName, UserPassword FROM User WHERE UserName == ?').get(username);

        // user not found => error
        if (!user)
            return res.status(401).send('User does not exist');

        // try to match password
        const match = await bcrypt.compare(password, user.UserPassword);

        // SUCCESS: set session user (login)
        if (match)
        {
            req.session.user = user.UserName;
            return res.send('Login successful');
        }
        else
            return res.status(401).send('Incorrect password');
    }
    catch (err)
    {
        console.error('Error /login: ', err);
        return res.status(500).send('Internal server error');
    }
});

// route: shop.html
// invokes authenticate function => user must be logged in
app.get('/shop', authenticate, (req,res) => {
    res.sendFile(path.join(__dirname, '../public/', 'shop.html'));
});


// route: avatar.html
// authenticate => user must be logged in
app.get('/avatar', authenticate, (req,res) => {
    res.sendFile(path.join(__dirname, '../public/', 'avatar.html'));
});

// use routes (src/routes)
app.use('/user', userRoutes);
app.use('/item', itemRoutes);

// route: logout
// destroys session, redirect to login page
app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        if (err)
        {
            console.error('Error destroying session: ', err);
            return res.status(500).send('Unable to log out');
        }

        // SUCCESS, redirect to login page
        res.redirect('/login');
    });
});

// API endpoint: fetch user session data
// webpages (/shop) call this function on page load
// user must be logged in (obviously)
// ASYNC/AWAIT FORMAT
app.get('/api/getUser', authenticate, (req,res) => {
    try
    {
        const result = db.prepare(`
            SELECT UserName, UserGold, UserHat, UserShirt, UserPants
            FROM User
            WHERE UserName = ?
        `).get(req.session.user); 

        if (!result)
            return res.status(404).send('User not found');

        res.json({
            UserName: result.UserName,
            UserGold: result.UserGold,
            UserHat: result.UserHat,
            UserShirt: result.UserShirt,
            UserPants: result.UserPants
        });
    }
    catch (err)
    {
        console.error('Error /api/getUser: ', err);
        res.status(500).send('Internal server error');
    }
});

// fetch all shop items
// called by /shop on page load
app.get('/api/getItems', authenticate, (req,res) => {
    try
    {
        const items = db.prepare('SELECT * FROM Item').all();
        res.json({ items: items });
    }
    catch (err)
    {
        console.error("Error /api/getItems: ", err);
        return res.status(500).send('Error retrieving items');
    }
});

app.get('/api/winGold', authenticate, (req,res) => {

    try
    {
        const user = db.prepare('SELECT UserGold FROM User WHERE UserName = ?').get(req.session.user);
        db.prepare('UPDATE TABLE User')
    }
    catch (error)
    {
        console.error('Error /api/winGold: ', err);
        return res.status(500).send('Error winning gold');
    }
});

// handle all other requests
// not authenticated -> redirect to login
// authenticated -> redirect to avatar
app.use((req,res) => {
    if (!req.session.user)
        return res.redirect('/login');
    
    return res.redirect('/avatar');
})


// export 'app'
module.exports = app;