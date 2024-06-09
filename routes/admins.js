// routes/admins.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all admins for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const adminsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("admins")
      .get();
    const admins = adminsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new admin to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { name, email, domain, adminId } = req.body;

  if (!name || !email || !domain || !adminId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newAdmin = { name, email, domain };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("admins")
      .doc(adminId)
      .set(newAdmin);
    res.status(201).json({ id: docRef.id, ...newAdmin });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an admin in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { name, domain } = req.body;

  if (!name || !domain) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const adminRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("admins")
      .doc(id);
    const doc = await adminRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await adminRef.update({ name, domain });
    res.status(200).json({ id, name, domain });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an admin from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const adminRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("admins")
      .doc(id);
    const doc = await adminRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await adminRef.delete();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
