const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

const config = require('../config/config');
const logger = require('../config/logger');

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
    },
    extname: '.handlebars', // handlebars extension
    layoutsDir: path.resolve(__dirname, '../views/layouts/'), // location of handlebars templates
    defaultLayout: false, // name of main template
    partialsDir: path.resolve(__dirname, '../views/'), // location of your subtemplates aka. header, footer etc
  },
  viewPath: path.resolve(__dirname, '../views/'),
  extName: '.handlebars',
};

const transport = nodemailer.createTransport(config.email.smtp);
// use a template file with nodemailer
transport.use('compile', hbs(handlebarOptions));
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};
// for html templete
const sendEmailWithTemplete = async (to, subject, template, context) => {
  console.log('to', to)
  console.log('send email context', context)
  await transport.sendMail({
    from: config.email.from,
    to,
    cc: context?.cc ?? [],
    subject,
    template,
    context,
  });
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  sendEmailWithTemplete,
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
