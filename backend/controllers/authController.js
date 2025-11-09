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

    //Ensure phone number is in correct way
    let formattedPhoneNumber = phoneNumber;
    if(phoneNumber && !phoneNumber.startsWith("+")){
        formattedPhoneNumber = "+94" + phoneNumber.replace(/^0/, "");
    }

    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: formattedPhoneNumber,
      phoneNumber,
    });

    // Save to Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      phoneNumber: formattedPhoneNumber,
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

// ---Login User-----
export const loginUser = async (req,res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Email and Password are required"});
        }

        // use firebase identty Toolkit REST API for password authentication
        const apiKey = process.env.FIREBASE_API_KEY;
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: "POST",
              headers: {"Content-type": "application/json"},
              body: JSON.stringify({email, password, returnSecureToken: true}),
            }
        );

        const data = await response.json();

        if(!response.ok) {
          return res.status(400).json({message: data.error.message});
        }

        res.status(200).json({
          message: "Login Successful",
          token: data.idToken,
          refreshToken: data.refreshToken,
          email: data.email,
          expiresIn: data.expiresIn,
        });
    } catch (error) {
      console.error(" Login Failed: ", error);
      res.status(500).json({message: "Login failed", error: error.message});
    }
};