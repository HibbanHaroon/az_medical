// routes/attendance.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

// Get all attendance records for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  try {
    const attendanceSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .get();
    const attendanceRecords = attendanceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new attendance record to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { id, datetime, status, nurseName } = req.body;

  if (!id || !datetime || !status || !nurseName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newAttendance = { datetime, status, nurseName };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id)
      .set(newAttendance);
    res.status(201).json({ id: docRef.id, ...newAttendance });
  } catch (error) {
    console.error("Error adding attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an attendance record in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { datetime, status, nurseName } = req.body;

  if (!datetime || !status || !nurseName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const attendanceRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id);
    const doc = await attendanceRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRef.update({ datetime, status, nurseName });
    res.status(200).json({ id, datetime, status, nurseName });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an attendance record from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;

  try {
    const attendanceRef = db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id);
    const doc = await attendanceRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRef.delete();
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
