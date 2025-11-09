import QRCode from "qrcode";
import { bucket } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";

export const generateAndUploadQR = async (reservationId, userEmail) => {
  try {
    // Generate the QR code data and image buffer
    const qrData = { reservationId, email: userEmail };
    const qrImageBuffer = await QRCode.toBuffer(JSON.stringify(qrData));

    // Define unique file path in Cloud Storage
    const fileName = `qr_codes/${reservationId}_${uuidv4()}.png`;
    const file = bucket.file(fileName);

    // Upload to Firebase Storage (without using ACLs)
    await file.save(qrImageBuffer, {
      metadata: { contentType: "image/png" },
    });

    // Generate a signed URL
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    // Return signed download URL
    return url;
  } catch (error) {
    console.error("Error generating/uploading QR:", error);
    throw new Error("Failed to upload QR to Firebase Storage");
  }
};
