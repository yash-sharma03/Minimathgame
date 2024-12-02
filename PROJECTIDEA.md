TODO:
    webpages:
    minigame
    avatar
    profile pages
    shop page


SELECT *
FROM Item AS I INNER JOIN UserItem AS UI
ON I.ItemID = UI.ItemID


INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Black Hair', 'Hat', 20);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Brown Hair', 'Hat', 20); 
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Blond Hair', 'Hat', 20); 
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('White Hair', 'Hat', 20); 
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('White Cap', 'Hat', 50);  
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Red Cap', 'Hat', 50);     
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Blue Cap', 'Hat', 50); 
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Green Cap', 'Hat', 50); 
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Red Shirt', 'Shirt', 30);   
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Black Shirt', 'Shirt', 30);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Orange Shirt', 'Shirt', 30);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Purple Shirt', 'Shirt', 30);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Blue Sweater', 'Shirt', 70);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Green Sweater', 'Shirt', 70);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Striped Sweater', 'Shirt', 100);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('White Shorts', 'Pants', 40);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Red Shorts', 'Pants', 40);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Black Shorts', 'Pants', 40);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Black Jeans', 'Pants', 70);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Blue Jeans', 'Pants', 70);
INSERT INTO Item (ItemName, ItemType, ItemPrice) VALUES ('Camo Jeans', 'Pants', 100);

hats:
    bald (default)
    black hair 20
    brown hair 20
    blonde hair 20
    white hair 20

    white cap 50
    red cap 50
    blue cap 50
    green cap 50

shirts:
    white shirt (default)
    red shirt 30
    black shirt 30
    orange shirt 30
    purple shirt 30

    blue sweater 70
    green sweater 70
    striped sweater 100

pants:
    blue shorts (default)
    white shorts 40
    red shorts 40
    black shorts 40

    black jeans 70
    blue jeans 70
    camo jeans 100

# module: express

Express provides the basic functionality of the web server for us to branch off from.

# module: sqlite3

We decided to use SQLite for our database management system. Using SQLite increases our project's portability, and allows people to download the project and run a local server regardless of their environment. By using SQLite instead of another database management system like MySQL, it simplifies the demonstration process as there is no installation or configuration for new users.

# module: bcrypt

We added the bcrypt module to help us hash passwords, increasing user and system security. We use 10 salt rounds, and check passwords against the database when logging in to make sure that user information is secure, and that malicious actors cannot easily log into other people's accounts

# module: express-session

We installed the express-session module as an extension of express. This module allows the web server to remember the users interacting with the website. Thus users will stay logged in and can perform their actions (earning gold, buying items in shop, customizing avatar).

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
    UserItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ItemID INTEGER NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
)