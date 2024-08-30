const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");

// Helper function to get collection path
function getCollectionPath(clinicId, userId, isItStaff) {
  if (isItStaff && userId) {
    return `itStaff/${userId}/attendance`;
  }
  return `clinics/${clinicId}/attendance`;
}

// Get all attendance records for a specific clinic
router.get("/:clinicId", async (req, res) => {
  const { clinicId } = req.params;
  const { userId = null, isItStaff = false } = req.query;

  try {
    const attendanceSnapshot = await db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
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
  const { userId = null, isItStaff = false } = req.query;

  try {
    const doc = await db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
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
  const { userId = null, isItStaff = false } = req.query;
  const { id, nurseName, pastThirtyDays } = req.body;

  if (!id || !nurseName || !pastThirtyDays) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newAttendance = {
      nurseName,
      pastThirtyDays,
    };
    await db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
      .doc(id)
      .set(newAttendance);
    res.status(201).json({ id, ...newAttendance });
  } catch (error) {
    console.error("Error adding attendance record:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Update an attendance record in a specific clinic
router.put("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { userId = null, isItStaff = false } = req.query;
  const { nurseName, pastThirtyDays } = req.body;

  if (!nurseName || !pastThirtyDays) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const attendanceRef = db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
      .doc(id);
    const doc = await attendanceRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRef.update({
      nurseName,
      pastThirtyDays,
    });
    res.status(200).json({ id, nurseName, pastThirtyDays });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:clinicId/:id/checkIn", async (req, res) => {
  const { clinicId, id } = req.params;
  const { userId = null, isItStaff = false } = req.query;
  const { checkInTime } = req.body;

  try {
    await db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
      .doc(id)
      .update({
        "pastThirtyDays.0.checkInTime": new Date(checkInTime).toISOString(),
      });
    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
  }
});

router.put("/:clinicId/:id/checkOut", async (req, res) => {
  const { clinicId, id } = req.params;
  const { userId = null, isItStaff = false } = req.query;
  const { checkOutTime } = req.body;

  try {
    await db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
      .doc(id)
      .update({
        "pastThirtyDays.0.checkOutTime": new Date(checkOutTime).toISOString(),
      });
    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
  }
});

// Delete an attendance record from a specific clinic
router.delete("/:clinicId/:id", async (req, res) => {
  const { clinicId, id } = req.params;
  const { userId = null, isItStaff = false } = req.query;

  try {
    const attendanceRef = db
      .collection(getCollectionPath(clinicId, userId, isItStaff))
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
