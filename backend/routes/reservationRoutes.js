// backend/routes/reservationRoutes.js
import express from "express";
import { confirmReservation } from "../controllers/reservationController.js";

const router = express.Router();

router.post("/confirm", confirmReservation);

export default router;
