// controllers/baseController.js
const utilities = require("../utilities/")
const accountModel = require('../models/account-model');
const baseController = {}
baseController.buildHome = async function(req, res) {
  try {
    const latestNews = await accountModel.getLatestNews();
    const upcomingEvents = await accountModel.getUpcomingEvents();
    const testimonials = await accountModel.getActiveTestimonials();
    const siteFaqs = await accountModel.getAllSiteFaqs(); 
    const heroSlides = await accountModel.getActiveHeroSlides();  

    let nav = await utilities.getNav();
    res.render("pages/index", {
      title: "Home",
      nav,
      latestNews,
      upcomingEvents,
      testimonials,
      siteFaqs,
      heroSlides,
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.render("pages/index", {
      title: "Home",
      nav: await utilities.getNav(),
      latestNews: [],
      upcomingEvents: [],
      siteFaqs: [],
      testimonials: [],
      heroSlides: [],
    });
  }
}

module.exports=baseController;