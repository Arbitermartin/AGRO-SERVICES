// controllers/baseController.js
const utilities = require("../utilities/")
const accountModel = require('../models/account-model');
const baseController = {}
baseController.buildHome = async function (req, res) {
  try {
    const latestNews = await accountModel.getLatestNews();
    const upcomingEvents = await accountModel.getUpcomingEvents();
    const testimonials = await accountModel.getActiveTestimonials();
    const siteFaqs = await accountModel.getAllSiteFaqs();
    const heroSlides = await accountModel.getActiveHeroSlides();

    // ===== COUNTERS =====
    const totalMembers = await accountModel.countMembersOnly();
    const totalEvents = await accountModel.countUpcomingEvents();
    const totalNews = await accountModel.getTotalNews();

    // ===== LIVE SUPPORT STATUS =====
    const ictOnline = await accountModel.isIctSupportOnline();

    let nav = await utilities.getNav();
    res.render("pages/index", {
      title: "Home",
      nav,
      latestNews,
      upcomingEvents,
      testimonials,
      siteFaqs,
      heroSlides,
      totalMembers,
      totalEvents,
      totalNews,
      ictOnline,
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

module.exports = baseController;