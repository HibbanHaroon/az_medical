// routes/doctors.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctorsSnapshot = await db.collection("doctors").get();
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

// Add a new doctor
router.post("/", async (req, res) => {
  const { name, email, domain, clinicId } = req.body;

  if (!name || !email || !domain || !clinicId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newDoctor = { name, email, domain, clinicId };
    const docRef = await db.collection("doctors").add(newDoctor);
    res.status(201).json({ id: docRef.id, ...newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a doctor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, domain } = req.body;

  if (!name || !email || !domain) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const doctorRef = db.collection("doctors").doc(id);
    const doc = await doctorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await doctorRef.update({ name, email, domain });
    res.status(200).json({ id, name, email, domain });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a doctor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const doctorRef = db.collection("doctors").doc(id);
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
