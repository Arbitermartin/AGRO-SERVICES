// controllers/baseController.js
const utilities = require("../utilities/")
const baseController = {}

// baseController.buildHome = async function(req, res){
//   const nav = await utilities.getNav()
//   res.render("pages/index", {
//     title: "Youth Agro-services Network",
//     nav,
//     errors: null
//   })
// }
baseController.buildHome = async function(req, res) {
  try {
    const latestNews = await accountModel.getLatestNews(5);
    const upcomingEvents = await accountModel.getUpcomingEvents(5);

    let nav = await utilities.getNav();
    res.render("pages/index", {
      title: "Home",
      nav,
      latestNews,
      upcomingEvents,
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.render("pages/index", {
      title: "Home",
      nav: await utilities.getNav(),
      latestNews: [],
      upcomingEvents: [],
    });
  }
}

module.exports=baseController;