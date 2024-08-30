const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");

const getCollectionPath = (clinicId, userId, isITStaff) => {
  if (isITStaff) {
    return `itStaff/${userId}/attendance`;
  } else {
    return `clinics/${clinicId}/attendance`;
  }
};

// Get all attendance records for a specific clinic or IT staff
router.get("/:clinicId/:userId", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { isITStaff = false } = req.query;

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    const attendanceSnapshot = await db.collection(collectionPath).get();

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
router.get("/:clinicId/:userId", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { isITStaff = false } = req.query;

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    const doc = await db.collection(collectionPath).doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new attendance record to a specific clinic or IT staff
router.post("/:clinicId/:userId", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { id, nurseName, pastThirtyDays, isITStaff = false } = req.body;

  if (!id || !nurseName || !pastThirtyDays) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    const newAttendance = { nurseName, pastThirtyDays };
    const docRef = await db
      .collection(collectionPath)
      .doc(id)
      .set(newAttendance);

    res.status(201).json({ id: docRef.id, ...newAttendance });
  } catch (error) {
    console.error("Error adding attendance record:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

// Update an attendance record in a specific clinic or IT staff
router.put("/:clinicId/:userId", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { nurseName, pastThirtyDays, isITStaff = false } = req.body;

  if (!nurseName || !pastThirtyDays) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    const attendanceRef = db.collection(collectionPath).doc(userId);
    const doc = await attendanceRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendanceRef.update({ nurseName, pastThirtyDays });
    res.status(200).json({ id, nurseName, pastThirtyDays });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check-in functionality
router.put("/:clinicId/:userId/checkIn", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { checkInTime, isITStaff = false } = req.body;

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    await db
      .collection(collectionPath)
      .doc(userId)
      .update({
        "pastThirtyDays.0.checkInTime": new Date(checkInTime).toISOString(),
      });

    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
  }
});

// Check-out functionality
router.put("/:clinicId/:userId/checkOut", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { checkOutTime, isITStaff = false } = req.body;

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    await db
      .collection(collectionPath)
      .doc(userId)
      .update({
        "pastThirtyDays.0.checkOutTime": new Date(checkOutTime).toISOString(),
      });

    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Error updating attendance" });
  }
});

// Delete an attendance record from a specific clinic or IT staff
router.delete("/:clinicId/:userId", async (req, res) => {
  const { clinicId, userId } = req.params;
  const { isITStaff = false } = req.query;

  try {
    const collectionPath = getCollectionPath(clinicId, userId, isITStaff);
    const attendanceRef = db.collection(collectionPath).doc(userId);
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
