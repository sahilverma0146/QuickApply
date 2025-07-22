const express = require('express');
const jwt = require('jsonwebtoken');

exports.authMiddleware = async(req, res , next) =>{
    const authToken = req.headers.authorization;
    if(!authToken){
        return res.status(404).json({message : "no token found" , success :false})
    }

    const token = authToken.split(" ")[1];

    const decoded = jwt.verify(token, 'shhhhh');
    console.log(decoded);
    req.role = decoded.role;
    req.id = decoded.id
    next()

}