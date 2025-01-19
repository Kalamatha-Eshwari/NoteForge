const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Route for homepage
router.get('/', mainController.homepage);

// Route for about page
router.get('/about', mainController.about);

module.exports = router;
