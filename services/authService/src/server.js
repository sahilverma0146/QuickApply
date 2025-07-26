const express = require("express");
const app = express();

const mongoose = require("mongoose");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// mongoose connection
try {
  main().catch((err) => console.log(err));

  async function main() {
    await mongoose.connect(
      "mongodb+srv://sahilverma22146:PSB3srMC5k6oFigi@cluster0.76mtdif.mongodb.net/"
    );

    console.log("mongoose connected successfully");
  }
} catch (error) {
  console.log(error);
}


const authController = require("./controller/userController");

app.post("/register", authController.Register);
app.post("/login", authController.Login);

app.post('/otp' , authController.otpLogin)

app.post('/verifyOtp',authController.verifyOtp)


// write the routes by which we gt  the events from the event bus 
app.post("/events", (req, res) => {
  const  {type , data}  = req.body;
  console.log("Event received by auth-service:", type);

  if(type === "OTP-SENT"){
    console.log("the otp we got is" , data);

    // this will emit a new event to event-bus
    fetch("http://localhost:4004/events" , {
      method:"post",
      headers :{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        type:"VERIFY-OTP",
        data : data
      })
    })
  }
  
  if(type === "VERIFY-OTP"){
    console.log(data ," your otp sie")
    // // sent that data to a particular route
    // fetch("http://localhost:4000/verifyOtp",{
    //   method:"POST",
    //   headers:{
    //     "Content-Type":"application/json"
    //   },
    //   body:JSON.stringify({data})
    // })

  }
 

  res.status(200).json({ message: "Event received by auth-service" });
});

const port = 4000;
app.listen(port, () => {
  console.log("the authservice is running at 4000");
});
