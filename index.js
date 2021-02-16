const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

//Import Routes
const authRoute = require("./api/routes/auth");
const profileRoute = require("./api/routes/profile");

//Connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("db connected")
);

// middleware
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send('Open-Auth-api');
});

//Routes middlewares
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);

app.listen(process.env.PORT || 3000);
