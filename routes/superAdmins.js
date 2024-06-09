// routes/superAdmins.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all superAdmins for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const superAdminsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("superAdmins")
      .get();
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

// Add a new superAdmin to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newSuperAdmin = { name, email };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("superAdmins")
      .doc(id)
      .set(newSuperAdmin);
    res.status(201).json({ id: docRef.id, ...newSuperAdmin });
  } catch (error) {
    console.error("Error adding superAdmin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a superAdmin in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const superAdminRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("superAdmins")
      .doc(id);
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

// Delete a superAdmin from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const superAdminRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("superAdmins")
      .doc(id);
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
