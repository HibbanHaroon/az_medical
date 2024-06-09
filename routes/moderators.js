// routes/moderators.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all moderators for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const moderatorsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("moderators")
      .get();
    const moderators = moderatorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(moderators);
  } catch (error) {
    console.error("Error fetching moderators:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new moderator to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { name, email, id } = req.body;

  if (!name || !email || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newModerator = { name, email };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("moderators")
      .doc(id)
      .set(newModerator);
    res.status(201).json({ id: docRef.id, ...newModerator });
  } catch (error) {
    console.error("Error adding moderator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a moderator in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const moderatorRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("moderators")
      .doc(id);
    const doc = await moderatorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Moderator not found" });
    }

    await moderatorRef.update({ name });
    res.status(200).json({ id, name });
  } catch (error) {
    console.error("Error updating moderator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a moderator from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const moderatorRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("moderators")
      .doc(id);
    const doc = await moderatorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Moderator not found" });
    }

    await moderatorRef.delete();
    res.status(200).json({ message: "Moderator deleted successfully" });
  } catch (error) {
    console.error("Error deleting moderator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
