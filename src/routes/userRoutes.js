/**
 * route handling for user pages
 * 1: show all users
 * 2: individual user
 */

// import express module and route handler
const express = require('express');
const router = express.Router();

// TODO change to links to html
router.get('/', (req, res) => {
    res.send('list of users');
});

// export the router
module.exports = router;