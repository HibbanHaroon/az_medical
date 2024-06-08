// routes/arrivals.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.get("/:clinicId/:doctorId", async (req, res) => {
  try {
    const { clinicId, doctorId } = req.params;

    const querySnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .where("doctorID", "==", doctorId)
      .get();

    const matchingArrivals = [];
    querySnapshot.forEach((doc) => {
      const arrivalData = doc.data();
      const arrivalId = doc.id;
      matchingArrivals.push({ id: arrivalId, ...arrivalData });
    });

    return res.status(200).json({ arrivals: matchingArrivals });
  } catch (error) {
    console.error("Error retrieving arrivals:", error);
    return res.status(500).json({ message: "Error retrieving arrivals" });
  }
});

router.post("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const {
      arrivalTime,
      askedToWait,
      calledInTime,
      calledInside,
      inProgress,
      startTime,
      markExit,
      endTime,
      dob,
      doctorID,
      firstName,
      lastName,
    } = req.body;

    const arrivalData = {
      arrivalTime: new Date(arrivalTime).toISOString(),
      askedToWait: !!askedToWait,
      calledInTime: calledInTime ? new Date(calledInTime).toISOString() : null,
      calledInside: !!calledInside,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      inProgress: !!inProgress,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      markExit: !!markExit,
      dob: new Date(dob).toISOString(),
      doctorID,
      firstName,
      lastName,
    };

    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .add(arrivalData);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error("Error inserting arrival:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:clinicId/:arrivalId/askedToWait", async (req, res) => {
  try {
    const { clinicId, arrivalId } = req.params;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .doc(arrivalId)
      .update({ askedToWait: true });
    return res.status(200).json({ message: "Arrival updated successfully" });
  } catch (error) {
    console.error("Error updating arrival:", error);
    return res.status(500).json({ message: "Error updating arrival" });
  }
});

router.put("/:clinicId/:arrivalId/markExit", async (req, res) => {
  try {
    const { clinicId, arrivalId } = req.params;
    const { endTime } = req.body;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .doc(arrivalId)
      .update({ markExit: true, endTime: new Date(endTime).toISOString() });
    return res.status(200).json({ message: "Arrival updated successfully" });
  } catch (error) {
    console.error("Error updating arrival:", error);
    return res.status(500).json({ message: "Error updating arrival" });
  }
});

router.put("/:clinicId/:arrivalId/inProgress", async (req, res) => {
  try {
    const { clinicId, arrivalId } = req.params;
    const { startTime } = req.body;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .doc(arrivalId)
      .update({
        inProgress: true,
        startTime: new Date(startTime).toISOString(),
      });
    return res.status(200).json({ message: "Arrival updated successfully" });
  } catch (error) {
    console.error("Error updating arrival:", error);
    return res.status(500).json({ message: "Error updating arrival" });
  }
});

router.put("/:clinicId/:arrivalId/calledInside", async (req, res) => {
  try {
    const { clinicId, arrivalId } = req.params;
    const { calledInTime } = req.body;
    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .doc(arrivalId)
      .update({
        calledInside: true,
        calledInTime: new Date(calledInTime).toISOString(),
      });
    return res.status(200).json({ message: "Arrival updated successfully" });
  } catch (error) {
    console.error("Error updating arrival:", error);
    return res.status(500).json({ message: "Error updating arrival" });
  }
});

// Add other PUT routes for updating arrivals (calledInside, inProgress, markExit)

module.exports = router;
