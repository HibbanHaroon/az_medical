// routes/login.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctorsRef = db.collection("doctors");
    const snapshot = await doctorsRef
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        res.status(200).json({ doctorId: doc.id });
      });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "An error occurred while logging in" });
  }
});

module.exports = router;
