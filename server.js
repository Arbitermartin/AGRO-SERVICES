/**********************************************
 * this is the server.js which is primary for application which control all
 * whole project for agro-services Tanzania
 * ***************************/ 

const express = require("express");
const app = express();
const path = require("path");
const env = require("dotenv").config();

// Delivery security package
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash =require("connect-flash");

// ROUTES AND UTILITIES.
const accountRoute = require("./routes/accountRoute");
const expressLayouts = require("express-ejs-layouts");
const static = require("./routes/static");
const staticRoute = require("./routes/staticRoute");
const utilities = require("./utilities");
const baseController = require("./controllers/baseController");
const db = require("./database/db");


// ================MIDDLEWARE SETUP====================

// 1: Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2: Cookie Parser (needed for CSRF later)
app.use(cookieParser());

// 3: Rate limiting.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: "Too many requests from this IP. Please try again later.",
});
app.use(generalLimiter);

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 5,
//   message: "Too many login attempts. Please try again after 10 minutes.",
// });

// app.use(generalLimiter);
// app.use("/account/login", loginLimiter);

//4: Session Configuration (Improved Security)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
}));

// 5: The Flash Message
app.use(flash());
// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next();
});

// track online ict stafff
app.use(utilities.trackPresence);

//Login rate limiter now
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    req.flash("error", "Too many login attempts. Please try again after 10 minutes.");
    res.redirect("/account/login");
  },
});
app.use("/account/login", loginLimiter);

/*********************************
 * This is view template engine
 * **************************/ 
app.set("view engine","ejs");
app.use(expressLayouts);
app.set("layout","./layouts/layout");

//Static file
app.use(express.static(path.join(__dirname, 'public'))) ;

// Routes
app.use("/account", accountRoute);
app.use(static);
app.use("/", staticRoute);

// Build Home View.

app.get("/", utilities.handleErrors(baseController.buildHome));


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})