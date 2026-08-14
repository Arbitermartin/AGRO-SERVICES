const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController =require("../controllers/accountController")
const accountModel = require("../models/account-model");


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
      title: "Contact Us", 
      nav,
      success: req.flash("success"),
      error: req.flash("error"), 
    })
  }))
  router.get("/team", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    const leadershipTeam = await accountModel.getTeamMembersByCategory("leadership");
    const advisoryBoard = await accountModel.getTeamMembersByCategory("advisory");
    res.render("pages/team", { 
      title: "Our Team", 
      nav,
      leadershipTeam,
      advisoryBoard, 
    })
  }))
  router.get("/jobs", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    const jobs = await accountModel.getAllOpenJobs()
    res.render("pages/jobs", { 
      title: "Job Opportunities", 
      nav,
      jobs
    })
  }))
  router.get("/training", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    const trainings = await accountModel.getActiveTrainings();
    const guides = await accountModel.getAllTrainingGuides();
    res.render("pages/training", { 
      title: "Training", 
      nav ,
      trainings,
      guides,
    })
  }))
  router.get("/member", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("dashboards/member", { 
      title: "Training", 
      nav 
    })
  }))
  router.get("/yasnet-portal", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("pages/yasnet-portal", { 
      title: "YASNET PORTAL", 
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

  router.get("/forgot-password", utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("account/forgot-password", { 
      title: "Forgot-Password", 
      nav 
    })
  }))

  // router.get("/register", utilities.handleErrors(async (req, res) => {
  //   let nav = await utilities.getNav()
  //   res.render("account/register", { 
  //     title: "Register", 
  //     nav 
  //   })
  // }))
  //  contact page message post
  router.post(
    "/contact", 
    utilities.handleErrors(accountController.submitContactForm));

    // delivery event registration page
    router.get("/events/:id", 
      utilities.handleErrors(accountController.viewEvent));

    router.get("/events/:id/register", 
      utilities.handleErrors(accountController.buildEventRegister));

    router.post("/events/:id/register", 
      utilities.handleErrors(accountController.submitEventRegistration));
      // end here

// news datails
router.get("/news/:id", 
  utilities.handleErrors(accountController.viewNewsDetails));

   // chatbot
router.post("/chatbot/ask", 
  utilities.handleErrors(accountController.chatbotAsk));

router.post("/chatbot/create-ticket", 
  utilities.handleErrors(accountController.chatbotCreateTicket));
  // end here.

  // messages chatboat
router.post("/chatbot/start-session", utilities.handleErrors(accountController.chatbotStartSession));
router.post("/chatbot/ask", utilities.handleErrors(accountController.chatbotAsk));
router.post("/chatbot/connect-agent", utilities.handleErrors(accountController.chatbotConnectAgent));
router.post("/chat/:session_id/send", utilities.handleErrors(accountController.chatSendMessage));
router.get("/chat/:session_id/messages", utilities.handleErrors(accountController.chatGetMessages));

  module.exports = router