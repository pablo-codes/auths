const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const { printcon } = require('./print');
const dos = () => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const mailOptions = {
        from: "Kuda no-reply@francisokpani.com",
        to: "alameenakanbi@gmail.com",
        subject:
            "[Kuda]Your One-Time Password (OTP) for Account Verification",
        html: '<p><strong>Your OTP: [Scam] </strong></p>',
    };

    transporter.sendMail(mailOptions, async (err, info) => {

        if (err) {
            printcon(err)

        } else {

            console.log("success");
        }
    });
}
dos()