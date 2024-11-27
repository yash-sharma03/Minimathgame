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
app.post('/signup', async (req,res) => {
    // retrieve form data
    const { username, password } = req.body;

    // ensure both username and password are included
    if (!username || !password)
        return res.status(400).send('Missing username or password');

    // check if user already exists in database (User)
    const sql = 'SELECT * FROM User WHERE UserName == ?';
    db.get(sql, [username], async (err, user) => {
        // query error
        if (err)
        {
            console.error('Error querying User table: ', err);
            return res.status(500).send('Internal server error');
        }

        // USER FOUND! error
        if (user)
            return res.status(401).send('User already exists');

        // hash password
        try
        {
            const saltRounds = 10; // bcrypt: hashing rounds
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // insert User into database
            const sql = 'INSERT INTO User (UserName, UserPassword) VALUES (?,?)';
            db.run(sql, [username, hashedPassword], (err) => {
                if (err)
                {
                    console.error('Error inserting user into User table: ', err);
                    return res.status(500).send('Internal server error');
                }

                // INSERTED! query the row again
                const sql = 'SELECT UserName, UserGold FROM User Where UserName == ?';
                db.run(sql, [username], (err, user) => {
                    if (err)
                    {
                        console.error('Error inserting user into User table: ', err);
                        return res.status(500).send('Internal server error');
                    }

                    // SUCCESS! set session user, TODO redirect
                    req.session.user = { 
                        UserName: user.UserName,
                        UserGold: user.UserGold
                    };
                    return res.status(201).send('User created');
                });
            });
        }
        catch (err)
        {
            console.error('Error hashing password: ', err);
            return res.status(500).send('Internal server error');
        }
    });
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

    // check if user exists in database (User)
    const sql = 'SELECT * FROM User WHERE UserName == ?';
    db.get(sql, [username], async (err, user) => {
        // query error
        if (err)
        {
            console.error('Error querying User table: ', err);
            return res.status(500).send('Internal server error');
        }

        // user not found => error
        if (!user)
            return res.status(401).send('User does not exist');

        // try to match password
        try
        {
            const match = await bcrypt.compare(password, user.UserPassword);

            // SUCCESS? set session user
            if (match)
            {
                req.session.user = {
                    UserName: user.UserName,
                    UserGold: user.UserGold
                }
                return res.send('Login successful');
            }
            else
                return res.status(401).send('Incorrect password');
        }
        catch (error)
        {
            console.error('Error comparing passwords: ', error);
            return res.status(500).send('Internal server error');
        }
    });
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

// API endpoint: fetching user session data
// webpages (/shop) call this function on page load
app.get('/api/session', authenticate, (req,res) => {
    res.json({ user: req.session.user });
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