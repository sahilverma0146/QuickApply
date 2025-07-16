const express = require("express");
const app = express();
const cors = require('cors')

app.use(cors());
app.use(express.json());


const authController = require("./controller/userController");

app.post('/register' , authController.Register);

const port = 4000; 
app.listen(port , () =>{
    console.log("the authservice is running at 4000")
})