require('dotenv').config();

const express=require('express');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const  MongoStore = require('connect-mongo');
const authRoutes = require('./server/routes/auth'); // Import the auth routes
const flash = require('connect-flash');
const path = require('path');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware needs to come before passport.initialize() and passport.session()
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) // Store session in MongoDB
}));

app.use(flash());

// Initialize Passport and use passport.session() after session middleware
app.use(passport.initialize());
app.use(passport.session());

require('./server/config/passport');  // Include passport configuration

app.use(methodOverride('_method'));

// Database connection
connectDB();


app.use(express.static('public'));

app.use('/auth', authRoutes); // Add '/auth' prefix for auth routes

//Templating Engine
app.use(expressLayouts)
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


//Routes

const indexRoutes = require('./server/routes/index');
app.use('/', indexRoutes);  // Handles both '/' and '/about' routes
//app.use('/',require('./server/routes/auth'));
app.use('/',require('./server/routes/dashboard'));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//Handle 404

app.get('*', function(req, res) {
    // Ensure title is passed even for the 404 page
    res.status(404).render('404', {
       title: "Page Not Found"  // Define a title for 404 pages
    });
 });
 


 
app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})

