const nodemailer = require('nodemailer');
const { EMAIL, PASS } = require('../utlis/config');

const sendEmailConfirmation = (email, order) => {

  // console.log("email", email)
  // console.log("order", order)
  const transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASS
    }
  });

  const mailOptions = {
    from: EMAIL,
    to: email.email,
    subject: 'Ticket Purchase Confirmation',
    text: `Hello ${email.username},
      Your payment for ${order.ticketType} tickets has been successfully completed. 
      Ticket count: ${order.quantity}.
      Your total is ₹${order.totalAmount}.`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
const transferredsendEmail = (user, sub,text) => {

  // console.log("email", email)
  // console.log("order", order)
  const transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASS
    }
  });

  const mailOptions = {
    from: EMAIL,
    to: user.email,
    subject: sub,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


module.exports = sendEmailConfirmation ;
module.exports = transferredsendEmail ;