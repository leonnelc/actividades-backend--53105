const nodemailer = require("nodemailer");
const { MAIL_USER, MAIL_PASS } = require("../config/config");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

function sendMail(to, subject, html) {
  const mailOptions = {
    from: "Ecommerce <leonelcortes.testing@gmail.com>",
    to,
    subject,
    html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw error;
    }
  });
}

module.exports = { sendMail };
