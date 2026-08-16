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
// const { doubleCsrf } = require("csrf-csrf");

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





//3: Session Configuration (Improved Security)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: false,  // false in development (true in production with HTTPS)
    sameSite: "lax",  // Good balance for development
    maxAge: 1000 * 60 * 60 * 4 // 4 hours
  }
}));

app.use((req,res, next) =>{
  if(!req.session.visited)req.session.visited= true;
  next();
})

//4:  rate limiter.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // A bit more relaxed for development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    req.flash("error", "Too many requests. Please try again later.");
    res.redirect(req.headers.referer || "/");
  },
});

app.use(generalLimiter);




// 5: The Flash Message
app.use(flash());
app.use((req,res,next)=>{
  res.locals.messages = require("express-messages")(req,res);
  next();
});


// track online ict stafff
app.use(utilities.trackPresence);

const { doubleCsrf } = require("csrf-csrf");

const {
  generateCsrfToken,      // ✅ correct name for v4
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.sessionID,
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },
  getCsrfTokenFromRequest: (req) => {
    return req.body?._csrf || req.headers["x-csrf-token"];
  },
});


app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

app.use(doubleCsrfProtection);



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

// // File Not Found Route - must be last route in list
// app.use(async (req, res, next) => {
//   next({status: 404, message: 'Sorry, we appear to have lost that page.'})
// })

// /* ***********************
// * Express Error Handler
// * Place after all other middleware
// *************************/
// app.use(async (err, req, res, next) => {
//   let nav = await utilities.getNav()
//   console.error(`Error at: "${req.originalUrl}": ${err.message}`)
//   res.render("errors/error", {
//     title: err.status || 'Server Error',
//     message: err.message,
//     nav
//   })
// })

// Build Home View.

app.get("/", utilities.handleErrors(baseController.buildHome));

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN" /* or the real error export from step 1 */) {
    req.flash("error", "Your session expired. Please try again.");
    return res.redirect("back");
  }
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav: [],
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
// const port = process.env.PORT
const PORT = process.env.PORT || 3000;
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
// app.listen(port, () => {
//   console.log(`app listening on ${host}:${port}`)
// })
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});