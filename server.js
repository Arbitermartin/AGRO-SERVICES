/**********************************************
 * this is the server.js which is primary for application which control all
 * whole project for agro-services Tanzania
 * ***************************/ 

const express = require("express")
const app = express()
const path = require("path");
const env = require("dotenv").config();
const accountRoute = require("./routes/accountRoute")
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static")
const utilities = require("./utilities")
const baseController = require("./controllers/baseController")



/*********************************
 * This is view template engine
 * **************************/ 
app.set("view engine","ejs")
app.use(expressLayouts)
app.set("layout","./layouts/layout")


/****************************************
 * static route
 * ***************************/ 
app.use(static)


/*********************************
 * 
 * build home view here.
 * ******************/ 
app.use(express.static(path.join(__dirname, 'public'))) 

// /* ***********************
//  * Routes (MUST come after middleware)
//  *************************/
app.use("/account", accountRoute)
app.get("/", utilities.handleErrors(baseController.buildHome))


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