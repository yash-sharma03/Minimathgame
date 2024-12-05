// db.js
// handle database connections, queries

// import: better-sqlite3 module => Database class
const Database = require('better-sqlite3');
const path = require('path');

// path to SQLite database
const dbPath = path.join(__dirname, '../database/app.db');

// create/connect to database
const db = new Database(dbPath, { verbose: console.log });

// create tables if they don't exist
try
{
    db.prepare(`
        CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            UserPassword TEXT NOT NULL,
            UserGold INTEGER NOT NULL DEFAULT 0,
            UserHat INTEGER NOT NULL DEFAULT 0,
            UserShirt INTEGER NOT NULL DEFAULT -1,
            UserPants INTEGER NOT NULL DEFAULT -2 
        )
    `).run();
    console.log('User table exists/created');

    db.prepare(`
        CREATE TABLE IF NOT EXISTS Item (
            ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            ItemName TEXT NOT NULL,
            ItemType TEXT NOT NULL,
            ItemPrice INTEGER NOT NULL
        )
    `).run();
    console.log('Item table exists/created');

    db.prepare(`
        CREATE TABLE IF NOT EXISTS UserItem (
            UserItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserID INTEGER NOT NULL,
            ItemID INTEGER NOT NULL,
            FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
            FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
        )
    `).run();
    console.log('UserItem table exists/created');
}
catch (err)
{
    console.error('Error setting up tables: ', err);
}

module.exports = db;