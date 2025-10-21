require("dotenv").config();
const cors = require("cors");
const express = require("express");
const passport = require('./auth/passportConfig');
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URL);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: process.env.ORIGIN_URL,
  credentials: true              
}));

app.use(passport.initialize())
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

app.use("/tasks", passport.authenticate("jwt", { session: false }), taskRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is working on port:${PORT}`);
})