// routes/ceos.js
const express = require("express");
const router = express.Router();
const { db, auth } = require("../services/firebase");

// Get all ceos
router.get("/", async (req, res) => {
  try {
    const ceosSnapshot = await db.collection("ceos").get();
    const ceos = ceosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(ceos);
  } catch (error) {
    console.error("Error fetching ceos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
