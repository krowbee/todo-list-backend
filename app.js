require("dotenv").config();
const cors = require("cors");
const express = require("express");
const passport = require('./auth/passportConfig');
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todo_db");

const app = express();
const port = 3000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true              
}));
app.use(passport.initialize())
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.use("/tasks", passport.authenticate("jwt", { session: false }), taskRoutes);
app.use("/auth", authRoutes);

app.listen(port, () => {
    console.log(`Website works at: http://localhost:${port}`);
})