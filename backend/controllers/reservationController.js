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

    res.status(200).json({message: "Reservation confirmed, QR uploaded & email sent!",
      qrUrl,
    });
  } catch (err) {console.error("❌ Reservation failed:", err);
    res.status(500).json({ message: "Failed to process reservation", error: err.message });
  }
};