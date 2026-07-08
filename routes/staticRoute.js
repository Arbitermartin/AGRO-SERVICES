const express = require("express")
const router = express.Router()
const utilities = require("../utilities")

router.get("/contact", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/contact", { 
      title: "Contact Page", 
      nav 
    })
  }))
  router.get("/login", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("account/login", { 
      title: "Login", 
      nav 
    })
  }))
  module.exports = router