// controllers/baseController.js
const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const stats = await utilities.getPortalStats()


  res.render("index", {
    title: "Youth Agro-services Network",
    nav,
    stats,
    errors: null
  })
}

module.exports=baseController;