const express = require("express");
const app = express();

const cors = require("cors");
// body parser
app.use(express.json());
app.use(cors());






// port listening
const port = 8080;
app.listen(`port`, () => {
  console.log(`App is listening at ${port}`);
});
