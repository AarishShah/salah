const express = require("express");

require("./db/mongoose");

const meeqatRouter = require("./routers/meeqat"); // set names later

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(meeqatRouter); // set names later

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
