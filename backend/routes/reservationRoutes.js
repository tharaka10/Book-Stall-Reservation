// backend/routes/reservationRoutes.js
import express from "express";
import {
	reserveStalls,
	getUserReservations,
	adminUsersWithStalls,
	getReserverByStall,
	getStalls,
} from "../controllers/reservationController.js";

const router = express.Router();

// Public/API
router.get("/stalls", getStalls); // needed by map to render availability
router.post("/reserve", reserveStalls); // Reserve stalls (max 3 enforced)
router.get("/user/:email/reservations", getUserReservations); // View user's reservations

// Admin
router.get("/admin/users-with-stalls", adminUsersWithStalls); // list users with their reserved stalls
router.get("/admin/stall/:id/reserver", getReserverByStall); // get reserver details for a stall

export default router;
