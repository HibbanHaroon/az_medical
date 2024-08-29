// routes/hrStaff.js
const express = require("express");
const router = express.Router();
const { db, auth } = require("../services/firebase");

// Get all hrStaff for a specific clinic
router.get("/", async (req, res) => {
  try {
    const hrStaffSnapshot = await db.collection("hrStaff").get();
    const hrStaff = hrStaffSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(hrStaff);
  } catch (error) {
    console.error("Error fetching hrStaff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new hrStaff
router.post("/", async (req, res) => {
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newHrStaff = { name, email };
    const docRef = await db.collection("hrStaff").doc(id).set(newHrStaff);
    res.status(201).json({ id: docRef.id, ...newHrStaff });
  } catch (error) {
    console.error("Error adding hrStaff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an hrStaff
router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hrStaffRef = db.collection("hrStaff").doc(id);
    const doc = await hrStaffRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "HR Staff not found" });
    }

    await hrStaffRef.update({ name });
    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating hrStaff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an hrStaff
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const hrStaffRef = db.collection("hrStaff").doc(id);
    const doc = await hrStaffRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "HR Staff not found" });
    }

    await hrStaffRef.delete();

    // Delete the user from the authentication table as well
    await auth.deleteUser(id);

    res.status(200).json({ message: "HR Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting hrStaff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
