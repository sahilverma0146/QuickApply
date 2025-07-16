const express = require('express');
const app = express();

const mongoose = require('mongoose');

const cors = require('cors');

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

const jobController = require("./controller/JobController")

app.post('/JobListing' , jobController.JobListing);
app.post('/UserRegisterForTheJob' , jobController.UserRegisterForTheJob);


const port = 4001 ;
app.listen(port , () =>{
    console.log("job listing service was successfully running on 4001")
})