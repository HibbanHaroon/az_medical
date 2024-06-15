// routes/tokens.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.get("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const tokenDoc = await db.collection("clinics").doc(clinicId).collection("tokens").doc("currentToken").get();

    if (tokenDoc.exists) {
      res.status(200).json(tokenDoc.data());
    } else {
      res.status(404).json({ message: "Token not found" });
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    res.status(500).json({ message: "Error retrieving token" });
  }
});

router.post("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { token, lastUpdated } = req.body;

    await db.collection("clinics").doc(clinicId).collection("tokens").doc("currentToken").set({ token, lastUpdated });

    res.status(200).json({ token, lastUpdated });
  } catch (error) {
    console.error("Error creating/updating token:", error);
    res.status(500).json({ message: "Error creating/updating token" });
  }
});

module.exports = router;
