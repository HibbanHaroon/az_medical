// routes/superAdmins.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all superAdmins for a specific clinic
router.get("/", async (req, res) => {
  try {
    const superAdminsSnapshot = await db.collection("superAdmins").get();
    const superAdmins = superAdminsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(superAdmins);
  } catch (error) {
    console.error("Error fetching superAdmins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new superAdmin
router.post("/", async (req, res) => {
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newSuperAdmin = { name, email };
    const docRef = await db
      .collection("superAdmins")
      .doc(id)
      .set(newSuperAdmin);
    res.status(201).json({ id: docRef.id, ...newSuperAdmin });
  } catch (error) {
    console.error("Error adding superAdmin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a superAdmin
router.put("/:id", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const superAdminRef = db.collection("superAdmins").doc(id);
    const doc = await superAdminRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    await superAdminRef.update({ name });
    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating superAdmin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a superAdmin
router.delete("/:id", async (req, res) => {
  try {
    const superAdminRef = db.collection("superAdmins").doc(id);
    const doc = await superAdminRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    await superAdminRef.delete();
    res.status(200).json({ message: "SuperAdmin deleted successfully" });
  } catch (error) {
    console.error("Error deleting superAdmin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
