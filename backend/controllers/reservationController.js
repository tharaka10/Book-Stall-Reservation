// // backend/controllers/reservationController.js
// import { generateAndUploadQR } from "../services/qrService.js";
// import { sendReservationEmail } from "../services/emailService.js";

// export const confirmReservation = async (req, res) => {
//   try {
//     const { reservationId, email, stalls, publisherName } = req.body;
//     console.log("🟢 Incoming reservation:", { reservationId, email, stalls, publisherName });

//     // Step 1 — generate QR and upload
//     console.log("🟢 Generating QR...");
//     const qrUrl = await generateAndUploadQR(reservationId, email);
//     console.log("✅ QR uploaded successfully:", qrUrl);

//     // Step 2 — send email
//     console.log("🟢 Sending email...");
//     await sendReservationEmail(
//       email,
//       { id: reservationId, stalls, publisherName },
//       qrUrl
//     );
//     console.log("✅ Email sent successfully");

//     // Step 3 — response
//     res.status(200).json({
//       message: "Reservation confirmed and email sent successfully!",
//       qrUrl,
//     });
//   } catch (err) {
//     console.error("❌ Reservation failed:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to process reservation", error: err.message });
//   }
// };


import { generateAndUploadQR } from "../services/qrService.js";
import { sendReservationEmail } from "../services/emailService.js";
import { reserveStalls } from "./stallController.js"; // reuse it

export const confirmReservation = async (req, res) => {
  try {
    const { reservationId, email, stalls, publisherName } = req.body;
    console.log("Received reservation:", { reservationId, email, stalls, publisherName });

    // ✅ Mark stalls as reserved
    reserveStalls({ body: { stalls, email, publisherName } }, { 
      status: () => ({ json: () => {} }) // fake response for reuse
    });

    // ✅ Generate QR and upload to Firebase
    const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

    // ✅ Send email with QR code
    await sendReservationEmail(email, { id: reservationId, stalls, publisherName }, qrUrl);

    res.status(200).json({
      message: "Reservation confirmed, QR uploaded & email sent!",
      qrUrl,
    });
  } catch (err) {
    console.error("❌ Reservation failed:", err);
    res.status(500).json({ message: "Failed to process reservation", error: err.message });
  }
};
