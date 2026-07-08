// controllers/baseController.js
const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Youth Agro-services Network",
    nav,
    errors: null
  })
}

module.exports=baseController;