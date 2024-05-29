// sockets/arrivals.js
const handleSocketConnections = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("newArrival", (data) => {
      console.log("New arrival: ", data);
      socket.broadcast.emit("updateArrivals", data);
    });

    socket.on("arrivalStatusChanged", (data) => {
      console.log("Arrival Status Changed: ", data);
      socket.broadcast.emit("updateArrivals", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = handleSocketConnections;
