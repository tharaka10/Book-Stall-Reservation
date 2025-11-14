// // backend/index.js
// import express from "express";
// import dotenv from "dotenv";
// import reservationRoutes from "./routes/reservationRoutes.js";
// import authRoutes from "./routes/authRoutes.js";



// dotenv.config();
// const app = express();

// app.use(express.json());

// // Mount the routes
// app.use("/api/reservations", reservationRoutes);
// app.use("/api/auth", authRoutes);
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// backend/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import dotenv from "dotenv";
import stallRoutes from "./routes/stallRoutes.js";
import publisherRoutes from "./routes/publisherRoutes.js";

dotenv.config();
const app = express();

// ✅ Use CORS properly
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", 
      "https://publisher-portal.web.app",
      "https://organizer-portal-bookfair.web.app"], // your React app URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/publishers", publisherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
