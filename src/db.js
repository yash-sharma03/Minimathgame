// db.js
// handle database connections, queries

// verbose provides better logging/debug messages
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// path to SQLite database
const dbPath = path.join(__dirname, '../database/app.db');


// create/connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err)
        console.error('Error connecting to SQLite: ', err);
    else
        console.log('Connected to SQLite at: ', dbPath);
});


// TODO create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            UserPassword TEXT NOT NULL,
            UserGold INTEGER NOT NULL DEFAULT 0
        )
    `);
});



module.exports = db;