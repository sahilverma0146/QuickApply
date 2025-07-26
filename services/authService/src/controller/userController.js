const express = require("express");

const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const model = require("../model/userModel");
const userModel = model.userModel;

// services used to send the otp to your mail
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

exports.Register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (firstName, lastName, email, password) are required",
      });
    }

    const role = email.endsWith("@admin.com") ? "director" : "student";

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = new userModel({
      userName: {
        firstName,
        lastName,
      },
      email,
      password: hashedPassword,
      role,
    });

    await data.save();

    const token = jwt.sign(
      {
        id: data._id,
        firstName,
        lastName,
        email,
        role,
      },
      "shhhhh",
      { expiresIn: "7d" }
    );

    // 7. Store token in DB
    data.token = token;
    await data.save();

    // 8. Emit USERCREATED event
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "USERCREATED",
        data: {
          userId: data._id,
          email: data.email,
          role: data.role,
          token: data.token,
        },
      }),
    });

    // 9. Send response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in registering user",
      error: error.message,
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password.",
        success: false,
      });
    }

    const data = await userModel.findOne({ email });

    if (!data) {
      return res.status(401).json({
        message: "Email is not registered.",
        success: false,
      });
    }
    const token = jwt.sign(
      {
        id: data.id,
        email: data.email,
        role: data.role,
        userName: data.userName,
      },
      "shhhhh",
      { expiresIn: "1h" }
    );

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password.",
        success: false,
        token,
      });
    }

    data.token = token;
    data.save();

    res.status(200).json({
      message: "User logged in successfully.",
      success: true,
      data,
      token,
    });

    // this emit an event to event bus
    console.log("going to emit");
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        type: "USERLOGGEDIN",
        data: {
          userId: data._id,
          email: data.email,
          role: data.role,
          token: data.token,
        },
      }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "error in loggin the user.",
      success: false,
    });
  }
};

const storeOtp = {};
// for sending a mail to login in
exports.otpLogin = async (req, res) => {

  // fetchinng the mail from the body

  const {gmail} = req.body;
  // generate a random 6 digit number

  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    alphabets: false,
  });

  if (!otp) {
    res.status(200).json({ message: "sorry no otp generated", success: false });
  }

  // now the mail sending part

  (async () => {
    // Step 2: Create a transporter using the test account
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: "developer.drax@gmail.com",
        pass: "euwh qosm rxqp gkqi", // Not your normal Gmail password!
      },
    });

    // Step 3: Send email
    const info = await transporter.sendMail({
      from: '"Quick Apply" <test@example.com>',
      to: gmail,
      subject: "Testing",
      text: "Hello from Nodemailer!",
      html: `
    <p>Hello sir, please do not reply to this email.</p>
    <p>Your <strong>OTP</strong> code is: <b>${otp}</b></p>
  `,
    });

    console.log("Message sent:", info.messageId);
  })();

  storeOtp[gmail] = otp;

  // emit an event to event service
  try {
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        type: "OTP-SENT",
        data: otp,
      }),
    });
  } catch (err) {
    res.status(404).json({ message: "server failed", err });
  }

  res.status(200).json({ message: "generated otp is :", success: true, otp });
};

// endpoint to verify the otp
exports.verifyOtp = (req, res) => {
  const {otp , gmail} = req.body;
  const email = gmail;
  const generatedOtp = storeOtp[email];
  // const { data } = req.body; // OTP from event

  if (!generatedOtp) {
    return res.status(404).json({ message: "OTP from event not found" });
  }


  if (generatedOtp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  res.status(200).json({
    message: "OTP verified successfully ✅",
    success: true,
    clientOtp: otp,
    generatedOtp: generatedOtp,
  });
};
