/*
Account route
Deliver a login view
*/
// need resources
const express =require("express")
const router =new express.Router()
const accountController =require("../controllers/accountController")
const utilities =require("../utilities")



/******************************************
 * Deliver login view
 * unit 4 deliver login view activity
 * 
 ***************************************/
router.get("/login",utilities.handleErrors(accountController.buildLogin))


module.exports= router