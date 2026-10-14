const nodemailer = require("nodemailer");

const clean = (val) => (val ? String(val).replace(/['"]/g, "").trim() : "");

const host = clean(process.env.EMAIL_HOST) || "smtp.gmail.com";
const port = Number(clean(process.env.EMAIL_PORT) || 587);
const user = clean(process.env.EMAIL_USER);
const pass = clean(process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined
});

module.exports = transporter;