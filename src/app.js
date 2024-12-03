// app.js
// handle Express application (routes, middleware)

// import express modules
const express = require('express');
const path = require('path');
const session = require('express-session');
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
// if already logged in, redirect
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
        return res.status(400).json({ error: 'Missing username or password' });

    try
    {
        // new user cannot have same username as existing user
        const existingUser = db.prepare('SELECT UserName FROM User WHERE UserName == ?').get(username);
        if (existingUser) return res.status(401).json({ error: 'User already exists' });

        // hash provided password
        const saltRounds = 10; // bcrypt: hashing rounds
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        // insert user into database
        db.prepare('INSERT INTO User (UserName, UserPassword) VALUES (?,?)').run(username, hashedPassword);

        // query the user we just inserted
        const newUser = db.prepare('SELECT UserID FROM User WHERE UserName == ?').get(username);
        if (!newUser) return res.status(401).json({ error: 'Failed to query new user' });

        req.session.user = newUser.UserID;
        return res.status(201).json({ message: 'User created' });
    }
    catch (err)
    {
        console.error('Error /signup: ', err);
        return res.status(500).json({ error: 'Internal server error' });
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
        return res.status(400).json({ error: 'Missing username or password' });

    try
    {
        // try to find user
        const user = db.prepare('SELECT UserID, UserName, UserPassword FROM User WHERE UserName == ?').get(username);
        if (!user) return res.status(401).json({ error: 'User does not exist' });

        // try to match password
        const match = await bcrypt.compare(password, user.UserPassword);

        // SUCCESS: set session user (login)
        if (match)
        {
            req.session.user = user.UserID;
            return res.json({ message: 'Login successful' });
        }
        else
            return res.status(401).json({ error: 'Incorrect password'});
    }
    catch (err)
    {
        console.error('Error /login: ', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// route: shop.html
// invokes authenticate function => user must be logged in
app.get('/shop', authenticate, (req,res) => {
    res.sendFile(path.join(__dirname, '../public/', 'shop.html'));
});

// route: avatar.html
// authenticate => user must be logged in
app.get('/minigame', authenticate, (req,res) => {
    res.sendFile(path.join(__dirname, '../public/', 'minigame.html'));
});

// route: users.html
// authenticate => user must be logged in
app.get('/users', authenticate, (req,res) => {
    res.sendFile(path.join(__dirname, '../public/', 'users.html'));
});

// route: logout
// destroy session, redirect to login page
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

// API endpoint: fetch user data
// webpages (/shop, /users) call this function on page load
// authenticate => requires logged in
app.get('/api/getUser', authenticate, (req,res) => {
    try
    {
        // fetch data from User
        const result = db.prepare(`
            SELECT UserName, UserGold, UserHat, UserShirt, UserPants
            FROM User
            WHERE UserID = ?
        `).get(req.session.user); 

        if (!result) return res.status(404).send('User not found');

        // fetch all owned items from UserItem (NOTE: its ok if no items owned yet)
        const items = db.prepare('SELECT ItemID FROM UserItem WHERE UserID = ?').all(req.session.user);

        res.json({
            UserName: result.UserName,
            UserGold: result.UserGold,
            UserHat: result.UserHat,
            UserShirt: result.UserShirt,
            UserPants: result.UserPants,
            UserItems: items
        });
    }
    catch (err)
    {
        console.error('Error /api/getUser: ', err);
        res.status(500).send('Internal server error');
    }
});

// fetch all users (/users)
// called on page load
// authenticate => requires logged in
app.get('/api/getUsers', authenticate, (req,res) => {
    try
    {
        // fetch from User and Items (count owned)
        const users = db.prepare(`
            SELECT U.UserID, UserName, UserGold, UserHat, UserShirt, UserPants, COUNT(ItemID) UserItems
            FROM User U LEFT JOIN UserItem UI
            ON U.UserID = UI.UserID
            GROUP BY U.UserID`).all();
        res.json({ users: users });

        // count how many items each user has?
    }
    catch (err)
    {
        console.error('Error /api/getUsers: ', err);
        res.status(500).json({ error: 'Failed to get users' });
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

app.post('/api/buyItem', authenticate, (req,res) => {
    try
    {
        // extract item id from request body
        const { ItemID } = req.body;
        if (isNaN(ItemID)) return res.status(400).json({ error: 'Missing item ID' });

        // 1. query Item: how much gold does item cost
        // 2. query User: do you have enough gold
        // 3. query User: subtract UserGold
        // 4. query UserItem: insert new row with UserID and ItemID
        // 5. return; user will call /api/getUser again
        // transaction for atomicity
        const transaction = db.transaction(() => {
            const item = db.prepare('SELECT ItemPrice FROM Item WHERE ItemID = ?').get(ItemID);
            if (!item) return res.status(401).json({ error: 'Could not find item'});

            const user = db.prepare('SELECT UserGold FROM User WHERE UserID = ?').get(req.session.user);
            if (!user) return res.status(401).json({ error: 'Could not find user'});

            if (user.UserGold < item.ItemPrice)
                return res.status(400).json({ error: 'Insufficient gold'});

            db.prepare('UPDATE User SET UserGold = UserGold - ? WHERE UserID = ?').run(item.ItemPrice, req.session.user);
            db.prepare('INSERT INTO UserItem (UserID, ItemID) VALUES (?,?)').run(req.session.user, ItemID);
        });

        // run transaction
        transaction();

        return res.status(200).json({ message: 'Item purchased' });
    }
    catch (err)
    {
        console.error('Error /api/buyItem: ', err);
        return res.status(500).json({ error: 'Error buying item' });
    }
});

app.post('/api/equipItem', authenticate, (req,res) => {
    try
    {
        // extract item id from request body
        const { ItemID } = req.body;
        if (isNaN(ItemID)) return res.status(400).json({ error: 'Missing item ID' });


        // between UserHat, UserShirt, UserPants, which are we replacing
        if (ItemID > -1 && ItemID < 9)
            db.prepare('UPDATE User SET UserHat = ? WHERE UserID = ?').run(ItemID, req.session.user);
        else if (ItemID == -1 || (ItemID > 8 && ItemID < 16))
            db.prepare('UPDATE User SET UserShirt = ? WHERE UserID = ?').run(ItemID, req.session.user);
        else if (ItemID == -2 || (ItemID > 16 && ItemID < 22))
            db.prepare('UPDATE User SET UserPants = ? WHERE UserID = ?').run(ItemID, req.session.user);
        else
            return res.status(400).json({ error: 'Invalid item ID'});


        return res.status(200).json({ message: 'Item equipped' });
    }
    catch (err)
    {
        console.error('Error /api/equipItem: ', err);
        return res.status(500).json({ error: 'Error equipping item' });
    }
});

app.post('/api/winGold', authenticate, (req,res) => {
    try
    {
        db.prepare('UPDATE User SET UserGold = UserGold+10 WHERE UserID = ?').run(req.session.user);
        return res.status(200).json({ message: 'Gold added' });
    }
    catch (err)
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
    
    return res.redirect('/users');
})


// export 'app'
module.exports = app;