const utilities = require("../utilities")
const path = require("path");
const bcrypt = require('bcrypt'); // For password hashing
const accountModel = require("../models/account-model");

const db = require('../database/db');
const { title } = require("process");

async function accountManagement(req,res,next){
    res.render("dashboards/index", {
        title: "YASNET Dashboard",

      })

      
}
/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  });
}
/***************************
 * Deliver build login
 *******************/
async function buildLogin(req,res) {
  let nav = await utilities.getNav();
  res.render("account/login"),{
    title: "Login",
    nav,
    error: null
  }
  
}

/* ****************************************
 * Process registration
 * *************************************** */
async function registerAccount(req, res) {
  try {
    const { fullName, email, Phone_number, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await accountModel.registerAccount(fullName, email, Phone_number, hashedPassword);

    req.flash("success", "Registration successful. Please log in.");
    res.redirect("/account/login");
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      req.flash("error", "Email already exists. Please log in or use another email.");
      return res.redirect("/account/register");
    }

    res.status(500).send("Registration failed.");
  }
}
/* ****************************************
 * Process login and redirect based on role
 * *************************************** */
async function accountLogin(req, res) {
  try {
    const { email, password } = req.body;

    const account = await accountModel.getAccountByEmail(email);

    if (!account) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    const passwordMatch = await bcrypt.compare(password, account.password);

    if (!passwordMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    if (account.status !== "active") {
      req.flash("error", "Your account is not active yet. Please contact support.");
      return res.redirect("/account/login");
    }

    // Store minimal account info in session (never store the password hash)
    req.session.account = {
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      account_type: account.account_type,
    };

    switch (account.account_type) {
      case "admin":
        return res.redirect("/account/dashboard/admin");
      case "ict_staff":
        return res.redirect("/account/dashboard/ict-staff");
      case "member":
        return res.redirect("/account/dashboard/member");
      default:
        req.flash("error", "Account type not recognized.");
        return res.redirect("/account/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
}
/* ****************************************
 * Helper: get initials from a full name
 * e.g. "John Doe" -> "JD", "Grace" -> "G"
 * *************************************** */
function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
/* ****************************************
 * Delivery admin dashboard here.
 * *************************************** */
async function buildAdminDashboard(req, res) {
  let nav = await utilities.getNav();
  const account = req.session.account;
  const profile = (await accountModel.getProfileByAccountId(account.id)) || {};
  const birthPlace = profile.id ? (await accountModel.getBirthPlaceByProfileId(profile.id)) || {} : {};
  const adminDetails = profile.id ? (await accountModel.getAdminDetailsByProfileId(profile.id)) || {} : {};

  res.render("dashboards/index", {
    title: "Admin Dashboard",
    nav,
    account,
    initials: getInitials(account.full_name),
    profile,
    birthPlace,
    adminDetails,
     // Add these two lines 👇
  showNav: false,
  showFooter: false
  });
}
async function updateProfile(req, res) {
  try {
    const accountId = req.session.account.id;
    const { full_name, date_of_birth, gender, nationality, bio, region, district, ward, department, office, admin_role } = req.body;

    await accountModel.updateFullName(accountId, full_name);
    req.session.account.full_name = full_name;

    const profile = await accountModel.upsertProfile(accountId, { date_of_birth, gender, nationality, bio });
    await accountModel.upsertBirthPlace(profile.id, { region, district, ward });
    await accountModel.upsertAdminDetails(profile.id, { department, office, admin_role });

    req.flash("success", "Profile updated successfully.");
    res.redirect("/account/dashboard/admin?profileUpdated=true");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to update profile.");
    res.redirect("/account/dashboard/admin");
  }
}

async function buildIctStaffDashboard(req, res) {
  let nav = await utilities.getNav();
  res.render("dashboards/ict-staff", {
    title: "ICT Staff Dashboard",
    nav,
    account: req.session.account,
    initials: getInitials(req.session.account.full_name),
     // Add these two lines 👇
     showNav: false,
     showFooter: false
  });
}

async function buildMemberDashboard(req, res) {
  let nav = await utilities.getNav();
  res.render("dashboards/member", {
    title: "Member Dashboard",
    nav,
    account: req.session.account,
    initials: getInitials(req.session.account.full_name),
     // Add these two lines 👇
     showNav: false,
     showFooter: false
  });
}

/* ****************************************
 * Logout
 * *************************************** */
function accountLogout(req, res) {
  req.flash("success","You have been logged out successfully.");
  const flashMessages =req.session.flash;

  req.session.regenerate((err)=>{
    if(err) console.error(err);
    req.session.flash =flashMessages;
    res.redirect("/account/login")
  }) 
}



module.exports={
  accountManagement,buildLogin,buildRegister,registerAccount,accountLogin,buildAdminDashboard,updateProfile, buildIctStaffDashboard,buildMemberDashboard,accountLogout

}
