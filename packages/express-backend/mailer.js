import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

async function sendEmail(who, message, subject) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'musicschmusic308.309@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailDetails = {
    from: 'musicschmusic308.309@gmail.com',
    to: who,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailDetails, (error, info) => {
    if (error) {
      console.log('Failed to send email: ', error);
    }
    console.log('Email Success');
  });
}

export default {
  sendEmail,
};
