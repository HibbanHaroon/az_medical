// routes/nurses.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all nurses for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const nursesSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("nurses")
      .get();
    const nurses = nursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(nurses);
  } catch (error) {
    console.error("Error fetching nurses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new nurse to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newNurse = { name, email };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("nurses")
      .doc(id)
      .set(newNurse);
    res.status(201).json({ id: docRef.id, ...newNurse });
  } catch (error) {
    console.error("Error adding nurse:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a nurse in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const nurseRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("nurses")
      .doc(id);
    const doc = await nurseRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Nurse not found" });
    }

    await nurseRef.update({ name });
    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating nurse:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a nurse from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const nurseRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("nurses")
      .doc(id);
    const doc = await nurseRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Nurse not found" });
    }

    await nurseRef.delete();
    res.status(200).json({ message: "Nurse deleted successfully" });
  } catch (error) {
    console.error("Error deleting nurse:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
