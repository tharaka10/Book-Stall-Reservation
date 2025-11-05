// backend/index.js
import express from "express";
import dotenv from "dotenv";
import reservationRoutes from "./routes/reservationRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

// Mount the routes
app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
