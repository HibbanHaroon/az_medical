// routes/doctors.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.get("/", async (req, res) => {
  try {
    const doctorsSnapshot = await db.collection("doctors").get();
    const doctorLinks = doctorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(doctorLinks);
  } catch (error) {
    console.error("Error fetching doctor links:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
