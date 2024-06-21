// routes/doctors.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all doctors for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const doctorsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("doctors")
      .get();
    const doctors = doctorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new doctor to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { name, email, domain, roomNumber, id } = req.body;

  if (!name || !email || !domain || !roomNumber || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newDoctor = { name, email, domain, roomNumber };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("doctors")
      .doc(id)
      .set(newDoctor);
    res.status(201).json({ id: docRef.id, ...newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a doctor in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { name, domain, roomNumber } = req.body;

  if (!name || !domain || !roomNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const doctorRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("doctors")
      .doc(id);
    const doc = await doctorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await doctorRef.update({ name, domain, roomNumber });
    res.status(200).json({ id, name, domain, roomNumber });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a doctor from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const doctorRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("doctors")
      .doc(id);
    const doc = await doctorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await doctorRef.delete();
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
