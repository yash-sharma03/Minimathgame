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


// create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            UserPassword TEXT NOT NULL,
            UserGold INTEGER NOT NULL DEFAULT 0
        )
    `, (err) => {
        if (err) console.error('Error creating User table: ', err);
        else console.log('User table exists.');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS Item (
            ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            ItemName TEXT NOT NULL,
            ItemType TEXT NOT NULL,
            ItemPrice INTEGER NOT NULL
        )
    `, (err) => {
        if (err) console.error('Error creating Item table: ', err);
        else console.log('Item table exists.');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS UserItem (
            UserItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserID INTEGER NOT NULL,
            ItemID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
            FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Error creating UserItem table: ', err);
        else console.log('UserItem table exists.');
    });
});

module.exports = db;