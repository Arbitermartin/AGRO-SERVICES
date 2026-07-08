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

module.exports = utilities