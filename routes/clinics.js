const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Add a new clinic
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newClinic = { name };
    const docRef = await db.collection("clinics").add(newClinic);

    res
      .status(201)
      .json({ message: "Clinic added successfully", id: docRef.id });
  } catch (error) {
    console.error("Error adding clinic:", error);
    res.status(500).json({ message: "Error adding clinic" });
  }
});

// Get all clinics
router.get("/", async (req, res) => {
  try {
    const clinicsSnapshot = await db.collection("clinics").get();
    const clinics = clinicsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(clinics);
  } catch (error) {
    console.error("Error retrieving clinics:", error);
    res.status(500).json({ message: "Error retrieving clinics" });
  }
});

// Get clinic by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clinicDoc = await db.collection("clinics").doc(id).get();

    if (!clinicDoc.exists) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    res.status(200).json({ id: clinicDoc.id, ...clinicDoc.data() });
  } catch (error) {
    console.error("Error retrieving clinic:", error);
    res.status(500).json({ message: "Error retrieving clinic" });
  }
});

// Update a clinic
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await db.collection("clinics").doc(id).update({ name });
    res.status(200).json({ message: "Clinic updated successfully" });
  } catch (error) {
    console.error("Error updating clinic:", error);
    res.status(500).json({ message: "Error updating clinic" });
  }
});

// Delete a clinic
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("clinics").doc(id).delete();
    res.status(200).json({ message: "Clinic deleted successfully" });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    res.status(500).json({ message: "Error deleting clinic" });
  }
});

module.exports = router;
