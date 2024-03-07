import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemplate.js";

const transporter = nodemailer.createTransport({
service:"gmail",
auth: {
    user: process.env.SENDEMAIL,
    pass: process.env.SENDPASSWORDEMAIL,
},
});


async function sendOurEmail(email,url) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <emailst766@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: emailTemplate(url), // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //
}


async function sendResetPasswordMail(name, email, code) {
    const info = await transporter.sendMail({
        from: '"Fred Foo 👻" <emailst766@gmail.com>',
        to: email,
        subject: "Reset Password ✔",
        text: "Hello world?",
        html: `<p>Hi, '${name}' your verification code is: ${code}</p>`,
    });

    console.log("Message sent:", info.messageId);
}

// Function to notify admin about the update request
const notifyAdminAboutUpdate = (user, field, value) => {
    const mailOptions = {
        from:process.env.SENDEMAIL,
        to: process.env.SENDEMAIL,
        subject: 'User Update Request',
        text: `User ${user.userName} (${user.email}) has requested to update ${field} to ${value}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Notification sent:', info.response);
        }
    });
};





export {
    sendOurEmail,
    sendResetPasswordMail,
    notifyAdminAboutUpdate
};


