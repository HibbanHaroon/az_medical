// routes/calls.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.post("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { roomNumber, patientName, patientLastName, token } = req.body;

    const newCallRequest = {
      roomNumber,
      patientName,
      patientLastName,
      requestAttended: false,
      token,
    };

    const docRef = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("callRequests")
      .add(newCallRequest);
    return res
      .status(201)
      .json({ message: "Call request created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating call request:", error);
    return res.status(500).json({ message: "Error creating call request" });
  }
});

router.get("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const callRequestsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("callRequests")
      .where("requestAttended", "==", false)
      .get();

    const callRequests = callRequestsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(callRequests);
  } catch (error) {
    console.error("Error retrieving call requests:", error);
    return res.status(500).json({ message: "Error retrieving call requests" });
  }
});

router.put("/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { id, requestAttended } = req.body;

    if (!id || typeof requestAttended !== "boolean") {
      return res.status(400).json({
        message:
          "Invalid request. 'id' and 'requestAttended' are required fields and 'requestAttended' must be a boolean.",
      });
    }

    await db
      .collection("clinics")
      .doc(clinicId)
      .collection("callRequests")
      .doc(id)
      .update({ requestAttended });
    return res
      .status(200)
      .json({ message: "Call request updated successfully" });
  } catch (error) {
    console.error("Error updating call request:", error);
    return res.status(500).json({ message: "Error updating call request" });
  }
});

module.exports = router;
