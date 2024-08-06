const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");

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

// Get a specific attendance record by ID
router.get("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  try {
    const doc = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new attendance record to a specific clinic
router.post("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { id, datetime, status, nurseName, checkInTime, checkOutTime } =
    req.body;

  if (!id || !datetime || !status || !nurseName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newAttendance = {
      datetime,
      status,
      nurseName,
      checkInTime,
      checkOutTime,
    };
    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id)
      .set(newAttendance);
    res.status(201).json({ id: docRef.id, ...newAttendance });
  } catch (error) {
    console.error("Error adding attendance record:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Update an attendance record in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { datetime, status, nurseName, checkInTime, checkOutTime } = req.body;

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

    await attendanceRef.update({
      datetime,
      status,
      nurseName,
      checkInTime,
      checkOutTime,
    });
    res
      .status(200)
      .json({ id, datetime, status, nurseName, checkInTime, checkOutTime });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:clinicId/:id/checkIn", async (req, res) => {
  try {
    const { clinicId, id } = req.params;
    const { checkInTime } = req.body;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id)
      .update({ checkInTime: new Date(checkInTime).toISOString() });
    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
  }
});

router.put("/:clinicId/:id/checkOut", async (req, res) => {
  try {
    const { clinicId, id } = req.params;
    const { checkOutTime } = req.body;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("attendance")
      .doc(id)
      .update({ checkOutTime: new Date(checkOutTime).toISOString() });
    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
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
