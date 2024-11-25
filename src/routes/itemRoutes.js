/**
 * route handling for items/individual pages
 * 1: show all items
 * 2: individual item
 */

// import express module and route handler
const express = require('express');
const router = express.Router();

// TODO change to links to html
router.get('/', (req, res) => {
    res.send('list of items');
});

// export the router
module.exports = router;