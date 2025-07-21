const express = require("express");

const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const model = require("../model/userModel");
const userModel = model.userModel;

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

    const token = jwt.sign({ role }, "shhhhh");
    console.log(token, "JWT token created during registration");

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
      token,
    });

    await data.save();

    // this will give us thee event sent successfully
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data,
    });
    // emit an event
    console.log("going to emit");
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Getting error in registering the user",
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
