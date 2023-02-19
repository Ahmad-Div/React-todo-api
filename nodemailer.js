import nodemailer from "nodemailer";
import dotenv from "dotenv";
import randomString from "randomstring";

dotenv.config();

export const sendTodoNotification = (email) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AHMAD_SOFTWARE_GMAIL,
      pass: process.env.AHMAD_SOFTWARE_GMAIL_APP_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.AHMAD_SOFTWARE_GMAIL,
    to: email,
    subject: "Todo Notification",
    text: `You have todos that not done yet, come and improve your      productivity <a target="_blank" href="https://todoapp.com"> 
          </a>`,
  };

  if (email === "") {
    console.log("there is an error");
  } else {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(email);
      }
    });
  }
};

export const sendPlanNotification = (email) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AHMAD_SOFTWARE_GMAIL,
      pass: process.env.AHMAD_SOFTWARE_GMAIL_APP_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.AHMAD_SOFTWARE_GMAIL,
    to: email,
    subject: "Plan Notification",
    text: `You have plans that not done yet, come and improve your      productivity <a target="_blank" href="https://todoapp.com"> 
          </a>`,
  };

  if (email === "") {
    console.log("there is an error");
  } else {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(email);
      }
    });
  }
};

let code = "";

export const sendCode = (email) => {
  let verifyCode = randomString.generate({
    length: 6,
    charset: "numeric",
  });
  code = verifyCode;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AHMAD_SOFTWARE_GMAIL,
      pass: process.env.AHMAD_SOFTWARE_GMAIL_APP_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.AHMAD_SOFTWARE_GMAIL,
    to: email,
    subject: "Verification code",
    text: verifyCode,
  };

  if (email === "") {
    console.log("there is an error");
  } else {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(email, verifyCode);
      }
    });
  }
};

export const getVerifyCode = () => {
  return code;
};
