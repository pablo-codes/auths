const nodemailer = require("nodemailer");
const user = require('../Models/UserSchema')
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();
const otpGenerator = require("otp-generator");
const path = require("path");

const Verify = async (req, res) => {
  try {
    let news;
    const email = req.body.email;
    const oldEmail = await user.findOne({ email: email });
    const otp = otpGenerator.generate(8);
    if (oldEmail) {
      news = 'false'
      await user.findOneAndUpdate({ email: email }, { passcode: otp })
    } else {
      news = 'true'
      await user.create({
        email: email,
        passcode: otp
      })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const message1 = fs.readFileSync(path.join(__dirname, '../email.html'), "utf-8", (err) => {
      console.log(err)
    });
    const name = email.split("@", 2);

    const message = message1
      .replace("[User's Name]", name[0])
      .replace("[Insert OTP Code]", otp);

    const mailOptions = {
      from: "Pablo-Codes no-reply@francisokpani.com",
      to: email,
      subject:
        "[Pablo-codes]Your One-Time Password (OTP) for Account Verification",
      html: message,
    };

    transporter.sendMail(mailOptions, async (err, info) => {

      if (err) {
        console.log('stress')
        return res.send({ status: "fail", message: err });

      } else {

        return res.send({ status: "success", message: "Email Sent", data: email, new: news });
      }
    });
  } catch (error) {
    console.log('fuck')
    return res.send({ status: "fail", message: error })
  }
};

const Check = async (req, res) => {
  try {
    const { email, passcode } = req.body
    const oldEmail = await user.findOne({ email: email });
    if (!oldEmail) {
      const error = email + 'does not exist please re check the email put.'
      return res.send({ status: "fail", err: error })
    } else {
      let date = oldEmail.updatedAt;
      const formerDate = new Date(date);
      const currentDate = new Date();
      const timeDifference = currentDate - formerDate;
      const twentyMinutesInMilliseconds = 20 * 60 * 1000;
      if (timeDifference <= twentyMinutesInMilliseconds) {
        if (oldEmail.passcode) {
          if (oldEmail.passcode == passcode) {
            await user.updateOne({ email: oldEmail.email }, { $unset: { passcode: 1 } })
            if (oldEmail) {
              news = 'false'
            } else {
              news = 'true'
            }
            console.log('okay')
            return res.send({ status: 'success', message: "passcode verified successfully", data: email, new: news })
          }
        } else {
          return res.send({ status: 'fail', message: 'No otp detected.' })
        }

      } else {
        if (oldEmail.passcode) {
          await user.updateOne({ email: oldEmail.email }, { $unset: { passcode: 1 } })

        }

        return res.send({ status: 'fail', message: 'More than 20 minutes have passed.' })
      }
    }

  } catch (error) {
    return res.send({ status: 'fail', message: error.message })
  }
}

const Signup = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log('hello')
    const encryptPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign(
      { email: email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "7d"
      }
    );
    await user.findOneAndUpdate({ email: email }, { password: encryptPassword, token: token })

    return res.send({ status: 'success', message: "user verified successfully", data: token })
  } catch (error) {
    return res.send({ status: 'fail', message: err })
  }

}

const Signin = async (req, res) => {
  try {
    const { email, password } = req.body
    const oldEmail = await user.findOne({ email: email });
    const encryptPassword = await bcrypt.compare(password, oldEmail.password);
    if (encryptPassword) {
      const token = jwt.sign(
        { email: email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "7d"
        }
      );
      await user.findOneAndUpdate({ email: email }, { token: token })
      return res.send({ status: 'success', message: "user verified successfully", data: token })
    } else {
      return res.send({ status: 'fail', message: "Invalid Password" })
    }

  } catch (error) {
    return res.send({ status: 'fail', message: error.message })
  }
}

module.exports = { Verify, Check, Signup, Signin };
