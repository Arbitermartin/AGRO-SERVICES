/**********************************************
 * this is the server.js which is primary for application which control all
 * whole project for agro-services Tanzania
 * ***************************/ 

const express = require("express")
const app = express()
const env = require("dotenv").config();
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static")



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
app.get("/", function(req,res){
    res.render("index",{title: "Home"})
})


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