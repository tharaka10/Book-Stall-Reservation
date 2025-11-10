import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authJwt.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Token is valid!", user: req.user });
  });

export default router;
