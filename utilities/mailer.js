/**
 * Email sending is not yet connected.
 * Once the app is hosted, wire this up to Gmail SMTP using nodemailer:
 *
 * const nodemailer = require("nodemailer");
 * const transporter = nodemailer.createTransport({
 *   service: "gmail",
 *   auth: {
 *     user: process.env.GMAIL_USER,
 *     pass: process.env.GMAIL_APP_PASSWORD, // use an App Password, not your real Gmail password
 *   },
 * });
 */

async function sendCredentialsEmail(toEmail, fullName, tempPassword) {
  // ✅ TEMPORARY — logs instead of sending, until Gmail SMTP is connected post-hosting
  console.log("=====================================");
  console.log("EMAIL WOULD BE SENT TO:", toEmail);
  console.log("Subject: Your ICT Staff Login Credentials — AgroServices");
  console.log(`Hello ${fullName},`);
  console.log(`Your ICT staff account has been created.`);
  console.log(`Email: ${toEmail}`);
  console.log(`Temporary Password: ${tempPassword}`);
  console.log(`Please log in and change your password immediately.`);
  console.log("=====================================");

  return { sent: false, reason: "Email not yet connected — logged to console instead." };

  /* ---------- Real implementation once hosted ----------
  await transporter.sendMail({
    from: `"AgroServices" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your ICT Staff Login Credentials — AgroServices",
    html: `
      <p>Hello ${fullName},</p>
      <p>Your ICT staff account has been created.</p>
      <p><b>Email:</b> ${toEmail}<br><b>Temporary Password:</b> ${tempPassword}</p>
      <p>Please log in and change your password immediately for security.</p>
    `,
  });
  return { sent: true };
  --------------------------------------------------------- */
}

module.exports = { sendCredentialsEmail };