// import { generateAndUploadQR } from "../services/qrService.js";
// import { sendReservationEmail } from "../services/emailService.js";
// import { reserveStalls } from "./stallController.js"; // reuse it

// export const confirmReservation = async (req, res) => {
//   try {
//     const { reservationId, email, stalls, publisherName } = req.body;
//     console.log("Received reservation:", { reservationId, email, stalls, publisherName });

//     // ✅ Mark stalls as reserved
//     reserveStalls({ body: { stalls, email, publisherName } }, { 
//       status: () => ({ json: () => {} }) // fake response for reuse
//     });

//     // ✅ Generate QR and upload to Firebase
//     const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

//     // ✅ Send email with QR code
//     await sendReservationEmail(email, { id: reservationId, stalls, publisherName }, qrUrl);

//     res.status(200).json({
//       message: "Reservation confirmed, QR uploaded & email sent!",
//       qrUrl,
//     });
//   } catch (err) {
//     console.error("❌ Reservation failed:", err);
//     res.status(500).json({ message: "Failed to process reservation", error: err.message });
//   }
// };

// import admin from "firebase-admin";
// import { generateAndUploadQR } from "../services/qrService.js";
// import { sendReservationEmail } from "../services/emailService.js";

// // ✅ Confirm reservation and update Firestore
// export const confirmReservation = async (req, res) => {
//   try {
//     const { reservationId, email, stalls, publisherName } = req.body;

//     console.log("🟢 Received reservation:", {
//       reservationId,
//       email,
//       stalls,
//       publisherName,
//     });

//     const db = admin.firestore();

//     // Step 1️⃣: Validate input
//     if (!email || !stalls || stalls.length === 0) {
//       return res.status(400).json({ message: "Invalid reservation data." });
//     }

//     // Step 2️⃣: Check for already reserved stalls
//     const alreadyReserved = [];
//     for (const stallId of stalls) {
//       const stallDoc = await db.collection("stalls").doc(stallId).get();
//       if (stallDoc.exists && stallDoc.data().isReserved) {
//         alreadyReserved.push(stallId);
//       }
//     }

//     if (alreadyReserved.length > 0) {
//       return res.status(400).json({
//         message: `The following stalls are already reserved: ${alreadyReserved.join(", ")}`,
//       });
//     }

//     // Step 3️⃣: Mark each stall as reserved
//     await Promise.all(
//       stalls.map(async (stallId) => {
//         await db.collection("stalls").doc(stallId).set(
//           {
//             isReserved: true,
//             reservedBy: email,
//             publisherName,
//             reservedAt: new Date().toISOString(),
//           },
//           { merge: true }
//         );
//       })
//     );

//     // Step 4️⃣: Generate QR Code and upload to Firebase
//     const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

//     // Step 5️⃣: Save reservation in Firestore
//     await db.collection("reservations").doc(reservationId.toString()).set({
//       reservationId,
//       email,
//       publisherName,
//       stalls,
//       qrUrl,
//       createdAt: new Date().toISOString(),
//     });

//     // Step 6️⃣: Send confirmation email with QR code
//     await sendReservationEmail(email, { id: reservationId, stalls, publisherName }, qrUrl);

//     console.log("✅ Reservation successful for:", email);

//     // Step 7️⃣: Return success response
//     res.status(200).json({
//       message: "Reservation confirmed, QR uploaded & email sent!",
//       qrUrl,
//     });
//   } catch (err) {
//     console.error("❌ Reservation failed:", err);
//     res.status(500).json({
//       message: "Failed to process reservation",
//       error: err.message,
//     });
//   }
// };

// import admin from "firebase-admin";
// import { generateAndUploadQR } from "../services/qrService.js";
// import { sendReservationEmail } from "../services/emailService.js";

// /**
//  * ✅ Get all stalls from Firestore
//  * Returns a list of all stalls (reserved or not)
//  */
// export const getAllStalls = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     const snapshot = await db.collection("stalls").get();

//     if (snapshot.empty) {
//       return res.status(200).json([]);
//     }

//     const stalls = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     res.status(200).json(stalls);
//   } catch (err) {
//     console.error("❌ Failed to fetch stalls:", err);
//     res.status(500).json({
//       message: "Error fetching stalls",
//       error: err.message,
//     });
//   }
// };

// /**
//  * ✅ Confirm reservation and update Firestore
//  * Creates a reservation record, updates stall status, generates QR,
//  * uploads it to Firebase Storage, and sends confirmation email.
//  */
// export const confirmReservation = async (req, res) => {
//   try {
//     const { reservationId, email, stalls, publisherName } = req.body;

//     console.log("🟢 Received reservation:", {
//       reservationId,
//       email,
//       stalls,
//       publisherName,
//     });

//     const db = admin.firestore();

//     // Step 1️⃣: Validate input
//     if (!email || !stalls || stalls.length === 0) {
//       return res.status(400).json({ message: "Invalid reservation data." });
//     }

//     // Step 2️⃣: Check for already reserved stalls
//     const alreadyReserved = [];
//     for (const stallId of stalls) {
//       const stallDoc = await db.collection("stalls").doc(stallId).get();
//       if (stallDoc.exists && stallDoc.data().isReserved) {
//         alreadyReserved.push(stallId);
//       }
//     }

//     if (alreadyReserved.length > 0) {
//       return res.status(400).json({
//         message: `The following stalls are already reserved: ${alreadyReserved.join(", ")}`,
//       });
//     }

//     // Step 3️⃣: Mark each stall as reserved
//     await Promise.all(
//       stalls.map(async (stallId) => {
//         await db.collection("stalls").doc(stallId).set(
//           {
//             isReserved: true,
//             reservedBy: email,
//             publisherName,
//             reservedAt: new Date().toISOString(),
//           },
//           { merge: true }
//         );
//       })
//     );

//     // Step 4️⃣: Generate QR Code and upload to Firebase
//     const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

//     // Step 5️⃣: Save reservation in Firestore
//     await db.collection("reservations").doc(reservationId.toString()).set({
//       reservationId,
//       email,
//       publisherName,
//       stalls,
//       qrUrl,
//       createdAt: new Date().toISOString(),
//     });

//     // Step 6️⃣: Send confirmation email with QR code
//     await sendReservationEmail(email, { id: reservationId, stalls, publisherName }, qrUrl);

//     console.log("✅ Reservation successful for:", email);

//     // Step 7️⃣: Return success response
//     res.status(200).json({
//       message: "Reservation confirmed, QR uploaded & email sent!",
//       qrUrl,
//     });
//   } catch (err) {
//     console.error("❌ Reservation failed:", err);
//     res.status(500).json({
//       message: "Failed to process reservation",
//       error: err.message,
//     });
//   }
// };

// /**
//  * ✅ Get all reservations of a specific user
//  */
// export const getUserReservations = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const db = admin.firestore();

//     const snapshot = await db
//       .collection("reservations")
//       .where("email", "==", email)
//       .orderBy("createdAt", "desc")
//       .get();

//     if (snapshot.empty) {
//       return res.status(200).json([]);
//     }

//     const reservations = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     res.status(200).json(reservations);
//   } catch (err) {
//     console.error("❌ Failed to fetch user reservations:", err);
//     res.status(500).json({
//       message: "Failed to fetch user reservations",
//       error: err.message,
//     });
//   }
// };

// /**
//  * ✅ (Optional) Admin: Unreserve a stall manually
//  */
// export const unreserveStall = async (req, res) => {
//   try {
//     const { stallId } = req.params;
//     const db = admin.firestore();

//     await db.collection("stalls").doc(stallId).update({
//       isReserved: false,
//       reservedBy: null,
//       publisherName: null,
//       reservedAt: null,
//     });

//     res.status(200).json({ message: `Stall ${stallId} unreserved successfully` });
//   } catch (err) {
//     console.error("❌ Failed to unreserve stall:", err);
//     res.status(500).json({
//       message: "Failed to unreserve stall",
//       error: err.message,
//     });
//   }
// };

// export default {
//   getAllStalls,
//   confirmReservation,
//   getUserReservations,
//   unreserveStall,
// };

import admin from "firebase-admin";
import { generateAndUploadQR } from "../services/qrService.js";
import { sendReservationEmail } from "../services/emailService.js";

/**
 * ✅ Get all stalls from Firestore
 * Returns a list of all stalls (reserved or not)
 */
export const getAllStalls = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("stalls").get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const stalls = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(stalls);
  } catch (err) {
    console.error("❌ Failed to fetch stalls:", err);
    res.status(500).json({
      message: "Error fetching stalls",
      error: err.message,
    });
  }
};

/**
 * ✅ Confirm reservation and update Firestore
 * Creates a reservation record, updates stall status, generates QR,
 * uploads it to Firebase Storage, and sends confirmation email.
 */
export const confirmReservation = async (req, res) => {
  try {
    const { reservationId, email, stalls, publisherName } = req.body;

    console.log("🟢 Received reservation:", {
      reservationId,
      email,
      stalls,
      publisherName,
    });

    const db = admin.firestore();

    // Step 1️⃣: Validate input
    if (!email || !stalls || stalls.length === 0) {
      return res.status(400).json({ message: "Invalid reservation data." });
    }

    // Step 2️⃣: Check for already reserved stalls
    const alreadyReserved = [];
    for (const stallId of stalls) {
      const stallDoc = await db.collection("stalls").doc(stallId).get();
      if (stallDoc.exists && stallDoc.data().isReserved) {
        alreadyReserved.push(stallId);
      }
    }

    if (alreadyReserved.length > 0) {
      return res.status(400).json({
        message: `The following stalls are already reserved: ${alreadyReserved.join(", ")}`,
      });
    }

    // Step 3️⃣: Mark each stall as reserved
    await Promise.all(
      stalls.map(async (stallId) => {
        await db.collection("stalls").doc(stallId).set(
          {
            isReserved: true,
            reservedBy: email,
            publisherName,
            reservedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      })
    );

    // Step 4️⃣: Generate QR Code and upload to Firebase
    const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

    // Step 5️⃣: Save reservation in Firestore
    await db.collection("reservations").doc(reservationId.toString()).set({
      reservationId,
      email,
      publisherName,
      stalls,
      qrUrl,
      createdAt: new Date().toISOString(),
    });

    // Step 6️⃣: Send confirmation email with QR code (optional)
    try {
      await sendReservationEmail(email, { id: reservationId, stalls, publisherName }, qrUrl);
      console.log("📧 Confirmation email sent to:", email);
    } catch (emailErr) {
      console.warn("⚠️ Email failed to send:", emailErr.message);
    }

    console.log("✅ Reservation successful for:", email);

    // Step 7️⃣: Return success response
    res.status(200).json({
      message: "Reservation confirmed successfully!",
      qrUrl,
    });
  } catch (err) {
    console.error("❌ Reservation failed:", err);
    res.status(500).json({
      message: "Failed to process reservation",
      error: err.message,
    });
  }
};

/**
 * ✅ Get all reservations of a specific user (publisher)
 */
export const getUserReservations = async (req, res) => {
  try {
    const { email } = req.params;
    const db = admin.firestore();

    const snapshot = await db
      .collection("reservations")
      .where("email", "==", email)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    // Cleanly map all required fields
    const reservations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        reservationId: data.reservationId || doc.id,
        stalls: data.stalls || [],
        qrUrl: data.qrUrl || null,
        publisherName: data.publisherName || "Unknown Publisher",
        email: data.email || email,
        createdAt: data.createdAt || null,
      };
    });

    res.status(200).json(reservations);
  } catch (err) {
    console.error("❌ Failed to fetch user reservations:", err);
    res.status(500).json({
      message: "Failed to fetch user reservations",
      error: err.message,
    });
  }
};

/**
 * ✅ Admin: Unreserve a stall manually
 */
export const unreserveStall = async (req, res) => {
  try {
    const { stallId } = req.params;
    const db = admin.firestore();

    await db.collection("stalls").doc(stallId).update({
      isReserved: false,
      reservedBy: null,
      publisherName: null,
      reservedAt: null,
    });

    res.status(200).json({ message: `Stall ${stallId} unreserved successfully` });
  } catch (err) {
    console.error("❌ Failed to unreserve stall:", err);
    res.status(500).json({
      message: "Failed to unreserve stall",
      error: err.message,
    });
  }
};

export default {
  getAllStalls,
  confirmReservation,
  getUserReservations,
  unreserveStall,
};
