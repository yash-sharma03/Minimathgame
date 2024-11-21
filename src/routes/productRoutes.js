/**
 * route handling for product pages
 * 1: show all products
 * 2: individual products
 */

// import express module and route handler
const express = require('express');
const router = express.Router();

// TODO change to links to html
router.get('/', (req, res) => {
    res.send('list of products');
});

// export the router
module.exports = router;