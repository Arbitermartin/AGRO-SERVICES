const utilities = require("../utilities")
const path = require("path");

/******************************
 * deliver login page
 */
async function buildLogin(req,res,next) {
    let nav= await utilities.getNav()
    res.render("account/login",{
        title: "login",
        nav,
        error: null,
        
    })
  
    
}
module.exports={buildLogin}