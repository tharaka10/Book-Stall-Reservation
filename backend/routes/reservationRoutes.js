// backend/routes/reservationRoutes.js
// import express from "express";
// import {
// 	reserveStalls,
// 	getUserReservations,
// 	adminUsersWithStalls,
// 	getReserverByStall,
// 	getStalls,
// } from "../controllers/reservationController.js";

// const router = express.Router();

// // Public/API
// router.get("/stalls", getStalls); // needed by map to render availability
// router.post("/reserve", reserveStalls); // Reserve stalls (max 3 enforced)
// router.get("/user/:email/reservations", getUserReservations); // View user's reservations

// // Admin
// router.get("/admin/users-with-stalls", adminUsersWithStalls); // list users with their reserved stalls
// router.get("/admin/stall/:id/reserver", getReserverByStall); // get reserver details for a stall


// export default router;

// import express from "express";
// import { confirmReservation } from "../controllers/reservationController.js";
// import { authenticateToken } from "../middleware/authJwt.js";

// const router = express.Router();

// // router.post("/reserve", confirmReservation);
// router.post("/reserve", authenticateToken, confirmReservation);
// export default router;

import express from "express";
import {
  getAllStalls,
  confirmReservation,
  getUserReservations,
  unreserveStall,
} from "../controllers/reservationController.js";
import { authenticateToken } from "../middleware/authJwt.js";

const router = express.Router();

// ✅ Logged-in users can view stalls
router.get("/stalls", authenticateToken, getAllStalls);

// ✅ Logged-in publishers can reserve
router.post("/reserve", authenticateToken, confirmReservation);

// ✅ User’s reservations
router.get("/user/:email", authenticateToken, getUserReservations);

// ✅ Admin can unreserve manually
router.delete("/admin/unreserve/:stallId", authenticateToken, unreserveStall);

export default router;
