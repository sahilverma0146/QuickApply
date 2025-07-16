const express = require("express");

const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const model = require("../model/userModel");
const userModel = model.userModel;

exports.Register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (firstName, lastName, email, password, role) are required",
      });
    }

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
    });

    await data.save();

    
    // emit an event
    console.log("going to emit")
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        event: {
          type: "UserCreated",
          data: {
            userId: data._id,
            email: data.email,
            role: data.role,
          },
        },
      }),
    });

    // this will give us thee event sent successfully 
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data,
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

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password.",
        success: false,
      });
    }

    // 2. Fetch user
    const fetchUser = await userModel.findOne({ email });

    if (!fetchUser) {
      return res.status(401).json({
        message: "Email is not registered.",
        success: false,
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, fetchUser.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password.",
        success: false,
      });
    }

    // 4. Login successful
    return res.status(200).json({
      message: "User logged in successfully.",
      success: true,
      user: fetchUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "error in loggin the user.",
      success: false,
    });
  }
};
