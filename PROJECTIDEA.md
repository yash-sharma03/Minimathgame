# module: express


# module: sqlite3

We decided to use SQLite for our database management system. This is to increase portability, and allow people to download the project, and run a local server regardless of their environment. By using SQLite instead of something like MySQL, it simplifies this process as there is no installation or configuration process for new users.


# module: bcrypt

hash passwords for user authentication


project tables:

User
    id
    username
    password (hashed?)
    gold

Item
    id
    item name
    price


UserItem
    id
    USER ID (foreign key)
    ITEM ID (foreign key)


CREATE TABLE IF NOT EXISTS User (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserName TEXT NOT NULL,
    UserPassword TEXT NOT NULL,
    UserGold INTEGER NOT NULL DEFAULT 0
)

CREATE TABLE IF NOT EXISTS Item (
    ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemName TEXT NOT NULL,
    ItemPrice INTEGER NOT NULL
)

CREATE TABLE IF NOT EXISTS UserItem (
    UserOwnsID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ItemID INTEGER NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User_T(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item_T(ItemID) ON DELETE CASCADE
)