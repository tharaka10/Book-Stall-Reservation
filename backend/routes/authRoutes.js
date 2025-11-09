import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
<<<<<<< HEAD
=======
import { registerUser } from "../controllers/authController.js";
>>>>>>> 49f2d8965dd11e0740bee7cbcd5767c9038990a3

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
