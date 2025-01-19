const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const flash = require('connect-flash'); // To handle flash messages

// Login route (GET)
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login', message: req.flash('error') });
});

// Register route (GET)
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register', messages: req.flash('error') });
});

// Login route (POST) using Passport.js for authentication
router.post('/login', 
  passport.authenticate('local', {
    successRedirect: '/',   // Redirect to dashboard on successful login
    failureRedirect: '/auth/register',       // Redirect to login page if login fails
    failureFlash: true               // Optionally show error messages
  })
);

// Register route (POST)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already taken');
      return res.redirect('/register'); // Redirect back to register if username is taken
    }

    const newUser = new User({
      username,
      password,
    });

    await newUser.save();
    res.redirect('/auth/login'); // Redirect to login page after successful registration
  } catch (error) {
    console.error(error);
    res.status(500).send('Registration failed');
  }
});

// Logout route (GET)
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/'); // Redirect to home page after logout
  });
});

module.exports = router;
