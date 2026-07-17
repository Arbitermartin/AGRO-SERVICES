const utilities = {}

/* Navigation */
utilities.getNav = async () => {
  return `
  <header class="navbar" id="navbar">
    <div class="container navbar-inner">
      <div class="nav-brand">
        /images/site/logo.webpYASNET Logo">
        <span class="nav-brand-name">YASNET</span>
      </div>

      <nav class="nav-links">
        / class="nav-link">Home</a>
        " class="nav-link">About Us</a>
        <aontact
        <team

        <div class="nav-actions">
          " class="btn btn-outline">Login</a>
          /register
        </div>
      </nav>
    </div>
  </header>
  `
}

/* Error Handler */
utilities.handleErrors = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
/* ****************************************
 * Middleware: require any logged-in account
 * *************************************** */
utilities.checkLogin = (req, res, next) => {
  if (req.session.account) {
    return next();
  }
  req.flash("error", "Please log in to access this page.");
  return res.redirect("/account/login");
};

/* ****************************************
 * Middleware factory: require a specific role
 * Usage: utilities.checkRole("admin")
 * *************************************** */
utilities.checkRole = (allowedRole) => {
  return (req, res, next) => {
    if (req.session.account && req.session.account.account_type === allowedRole) {
      return next();
    }
    req.flash("error", "You do not have permission to view that page.");
    return res.redirect("/account/login");
  };
};

module.exports = utilities