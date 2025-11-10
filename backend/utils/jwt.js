// backend/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// create a signed JWT token
export const signToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// verify jwt token 
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
