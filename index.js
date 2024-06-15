// index.js
const express = require("express");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const corsString = {
  origin: [
    "https://azz-medical-associates.vercel.app",
    "http://localhost:3000",
    "https://dev.df2at0r8xfim4.amplifyapp.com",
  ],
};

app.use(cors(corsString.origin));

const port = process.env.PORT || 3001;

app.use(bodyParser.json());

const loginRoutes = require("./routes/login");
const arrivalsRoutes = require("./routes/arrivals");
const doctorsRoutes = require("./routes/doctors");
const nursesRoutes = require("./routes/nurses");
const adminsRoutes = require("./routes/admins");
const moderatorsRoutes = require("./routes/moderators");
const superAdminsRoutes = require("./routes/superAdmins");
const callsRoutes = require("./routes/calls");
const clinicsRoutes = require("./routes/clinics");
const tokensRoutes = require("./routes/tokens");

app.use("/api", loginRoutes);
app.use("/api/arrivals", arrivalsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/nurses", nursesRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/moderators", moderatorsRoutes);
app.use("/api/superAdmins", superAdminsRoutes);
app.use("/api/calls", callsRoutes);
app.use("/api/clinics", clinicsRoutes);
app.use("/api/tokens", tokensRoutes);

app.get("/api/:clinicId/allArrivals", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const db = require("./services/firebase");
    const arrivalsSnapshot = await db
      .collection("clinics")
      .doc(clinicId)
      .collection("arrivals")
      .get();
    const arrivals = [];

    arrivalsSnapshot.forEach((doc) => {
      const arrivalData = doc.data();
      arrivalData.id = doc.id;
      arrivals.push(arrivalData);
    });

    res.status(200).json(arrivals);
  } catch (error) {
    console.error("Error fetching arrivals: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize socket.io
const io = socketio(server, {
  cors: {
    origin: corsString.origin,
    methods: ["GET", "POST"],
  },
});

// Importing and simply using the socket.io logic
const handleSocketConnections = require("./sockets/arrivals");
handleSocketConnections(io);
