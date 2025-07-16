const express = require("express");

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

    const data = new userModel({
      userName: {
        firstName,
        lastName,
      },
      email,
      password,
      role,
    });

    // await data.save();

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
