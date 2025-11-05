// backend/controllers/reservationController.js
import { generateAndUploadQR } from "../services/qrService.js";
import { sendReservationEmail } from "../services/emailService.js";

export const confirmReservation = async (req, res) => {
  try {
    const { reservationId, email, stalls, publisherName } = req.body;

    const qrUrl = await generateAndUploadQR(reservationId, email);
    await sendReservationEmail(
      email,
      { id: reservationId, stalls, publisherName },
      qrUrl
    );

    res.status(200).json({
      message: "Reservation confirmed and email sent successfully!",
      qrUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process reservation", error: err.message });
  }
};
