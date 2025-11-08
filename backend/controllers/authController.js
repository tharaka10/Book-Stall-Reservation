import admin from "firebase-admin";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = req.body;

    console.log("📩 Incoming registration:", req.body); // Debug log

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber,
    });

    // Save to Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      phoneNumber,
      createdAt: new Date(),
    });

    console.log("✅ User created:", userRecord.uid);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ message: error.message });
  }
};
