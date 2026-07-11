const express = require("express")
const router = express.Router()
const utilities = require("../utilities")


router.get("/about", utilities.handleErrors(async (req, res) => {
  let nav = await utilities.getNav()
  res.render("pages/about", { 
    title: "About Us", 
    nav 
  })
}))
router.get("/contact", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/contact", { 
      title: "Contact Page", 
      nav 
    })
  }))
  router.get("/team", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/team", { 
      title: "Our Team", 
      nav 
    })
  }))
  router.get("/jobs", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/jobs", { 
      title: "Job Opportunities", 
      nav 
    })
  }))
  router.get("/training", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/training", { 
      title: "Training", 
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
  router.get("/register", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("account/register", { 
      title: "Register", 
      nav 
    })
  }))
  module.exports = router