// routes/itStaff.js
const express = require("express");
const router = express.Router();
const { db, auth } = require("../services/firebase");

// Get all IT staff for a specific clinic
router.get("/", async (req, res) => {
  try {
    const itStaffSnapshot = await db.collection("itStaff").get();
    const itStaff = itStaffSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(itStaff);
  } catch (error) {
    console.error("Error fetching IT staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new IT staff member
router.post("/", async (req, res) => {
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newItStaff = { name, email };
    const docRef = await db.collection("itStaff").doc(id).set(newItStaff);
    res.status(201).json({ id: docRef.id, ...newItStaff });
  } catch (error) {
    console.error("Error adding IT staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an IT staff member
router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const itStaffRef = db.collection("itStaff").doc(id);
    const doc = await itStaffRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "IT Staff not found" });
    }

    await itStaffRef.update({ name });
    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating IT staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an IT staff member
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const itStaffRef = db.collection("itStaff").doc(id);
    const doc = await itStaffRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "IT Staff not found" });
    }

    await itStaffRef.delete();

    // Delete the user from the authentication table as well
    await auth.deleteUser(id);

    res.status(200).json({ message: "IT Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting IT staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
