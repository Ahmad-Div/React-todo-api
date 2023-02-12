import nodemailer from "nodemailer";
import dotenv from "dotenv";
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
