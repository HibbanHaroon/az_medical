// routes/calls.js
const express = require("express");
const router = express.Router();
const db = require("../services/firebase");

router.post("/", async (req, res) => {
  try {
    const { DoctorName, patientName, patientLastName } = req.body;

    const newCallRequest = {
      DoctorName,
      patientName,
      patientLastName,
      requestAttended: false,
    };

    const docRef = await db.collection("callRequests").add(newCallRequest);
    return res
      .status(201)
      .json({ message: "Call request created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating call request:", error);
    return res.status(500).json({ message: "Error creating call request" });
  }
});

router.get("/", async (req, res) => {
  try {
    const callRequestsSnapshot = await db
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

router.put("/", async (req, res) => {
  try {
    const { id, requestAttended } = req.body;

    if (!id || typeof requestAttended !== "boolean") {
      return res.status(400).json({
        message:
          "Invalid request. 'id' and 'requestAttended' are required fields and 'requestAttended' must be a boolean.",
      });
    }

    await db.collection("callRequests").doc(id).update({ requestAttended });
    return res
      .status(200)
      .json({ message: "Call request updated successfully" });
  } catch (error) {
    console.error("Error updating call request:", error);
    return res.status(500).json({ message: "Error updating call request" });
  }
});

module.exports = router;
