const express = require("express");
const router = express.Router();
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).send("Error registering");
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);  // ✅ DEBUG 1

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ msg: "Email & Password required" });
    }

    const user = await User.findOne({ email });

    console.log("USER FROM DB:", user); // ✅ DEBUG 2

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("DB PASSWORD:", user.password);
    console.log("ENTERED PASSWORD:", password);

    if (user.password !== password) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    res.json({
      msg: "Login success",
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server error");
  }
});



module.exports = router;