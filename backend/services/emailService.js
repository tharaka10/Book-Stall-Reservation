import nodemailer from "nodemailer";

export const sendReservationEmail = async (email, reservationDetails, qrUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BookFair Reservations" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Book Fair Stall Reservation Confirmation",
    html: `
      <h3>Hello ${reservationDetails.publisherName},</h3>
      <p>Your reservation has been confirmed!</p>
      <p><b>Stalls Reserved:</b> ${reservationDetails.stalls.join(", ")}</p>
      <p><b>Reservation ID:</b> ${reservationDetails.id}</p>
      <p>You can present the QR code below at the entrance:</p>
      <img src="${qrUrl}" alt="QR Code" style="width:150px;height:150px;">
      <p>Thank you for reserving with Colombo International Bookfair!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
