// import { generateAndUploadQR } from "../services/qrService.js";
// import { sendReservationEmail } from "../services/emailService.js";

// import { reserveStalls } from "./stallController.js"; // reuse it

// import { pool } from "../config/db.js";

// export const getStalls = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT id, name, size, map_position, is_reserved FROM stalls ORDER BY name ASC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch stalls", error: err.message });
//   }
// };

// export const reserveStalls = async (req, res) => {
//   const conn = await pool.getConnection();
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

//     const { email, businessName, phone, address, stallIds } = req.body;
//     if (!email || !businessName || !Array.isArray(stallIds) || stallIds.length === 0) {
//       return res.status(400).json({ message: "Invalid request: email, businessName and stallIds are required" });
//     }

//     if (stallIds.length > 3) {
//       return res.status(400).json({ message: "Cannot reserve more than 3 stalls in one reservation" });
//     }

//   await conn.beginTransaction();

//     // Count currently reserved stalls for this user (active reservations)
//     const [countRows] = await conn.query(
//       `SELECT COUNT(*) AS total
//        FROM reservation_stalls rs
//        JOIN reservations r ON rs.reservation_id = r.id
//        WHERE r.user_email = ? AND r.status = 'active'`,
//       [email]
//     );
//     // Ensure numeric addition, not string concatenation
//     const currentCount = Number(countRows[0].total) || 0;
//     if (currentCount + stallIds.length > 3) {
//       await conn.rollback();
//       return res.status(400).json({ message: `Reservation would exceed max 3 stalls per user (you already have ${currentCount})` });
//     }

//     // Lock the stalls rows for update and ensure availability
//     const placeholders = stallIds.map(() => '?').join(',');
//     const [stalls] = await conn.query(
//       `SELECT id, name, is_reserved FROM stalls WHERE id IN (${placeholders}) FOR UPDATE`,
//       stallIds
//     );

//     const unavailable = stalls.filter(s => s.is_reserved);
//     if (unavailable.length > 0 || stalls.length !== stallIds.length) {
//       await conn.rollback();
//       const ids = unavailable.map(u => u.id);
//       return res.status(400).json({ message: ids.length > 0 ? `These stalls are already reserved: ${ids.join(', ')}` : 'Invalid stall id(s) provided', unavailable });
//     }

//     const reservationId = uuidv4();
//     // Insert reservation with contact details
//     await conn.query(
//       `INSERT INTO reservations (id, user_email, business_name, phone_number, address, status)
//        VALUES (?,?,?,?,?, 'active')`,
//       [reservationId, email, businessName, phone || null, address || null]
//     );

//     // Insert reservation_stalls with uniqueness handling (a stall can only be in one reservation)
//     for (const stallId of stallIds) {
//       try {
//         await conn.query(
//           `INSERT INTO reservation_stalls (reservation_id, stall_id) VALUES (?,?)`,
//           [reservationId, stallId]
//         );
//       } catch (e) {
//         if (e && e.code === 'ER_DUP_ENTRY') {
//           await conn.rollback();
//           return res.status(400).json({ message: `Stall ${stallId} is already reserved` });
//         }
//         throw e;
//       }
//     }

//     // Generate a QR for each stall and save on reservation_stalls BEFORE committing.
//     // If any QR upload fails, roll back so that stalls remain unreserved and no reservation persists.
//     const qrResults = [];
//     for (const s of stalls) {
//       try {
//         const qrUrl = await generateAndUploadQR(reservationId, email, { stallId: s.id, stallName: s.name });
//         qrResults.push({ stallId: s.id, stallName: s.name, qrUrl });
//         await conn.query(
//           `UPDATE reservation_stalls SET qr_url = ? WHERE reservation_id = ? AND stall_id = ?`,
//           [qrUrl, reservationId, s.id]
//         );
//       } catch (qrErr) {
//         // Any failure -> rollback and surface error
//         await conn.rollback();
//         throw qrErr;
//       }
//     }

//     // Only mark stalls as reserved after QR URLs are successfully stored
//     await conn.query(
//       `UPDATE stalls SET is_reserved = 1 WHERE id IN (${placeholders})`,
//       stallIds
//     );

//     await conn.commit();

//     // Optionally send email (first QR only or extend template to multiple)
//     if (process.env.SEND_EMAIL === 'true') {
//       const stallNames = stalls.map(s => s.name);
//       const firstQr = qrResults[0]?.qrUrl || null;
//       try {
//         await sendReservationEmail(email, { id: reservationId, stalls: stallNames, publisherName: businessName }, firstQr);
//       } catch (e) {
//         console.error('Email sending failed:', e.message);
//       }
//     }

//     res.status(201).json({ message: "Reservation successful", reservationId, stalls: qrResults });
//   } catch (err) {
//     console.error(err);
//     try { await conn.rollback(); } catch (e) {}
//     res.status(500).json({ message: "Failed to create reservation", error: err.message });
//   } finally {
//     conn.release();

//   }
// };

// export const getUserReservations = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const [rows] = await pool.query(
//       `SELECT 
//          r.id,
//          r.user_email,
//          r.business_name,
//          r.phone_number,
//          r.address,
//          r.status,
//          r.created_at,
//          JSON_ARRAYAGG(JSON_OBJECT('stallId', s.id, 'stallName', s.name, 'qrUrl', rs.qr_url)) as stalls
//        FROM reservations r
//        JOIN reservation_stalls rs ON r.id = rs.reservation_id
//        JOIN stalls s ON rs.stall_id = s.id
//        WHERE r.user_email = ?
//        GROUP BY r.id
//        ORDER BY r.created_at DESC`,
//       [email]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch user reservations", error: err.message });
//   }
// };

// // --- Admin: list users with their reserved stalls ---
// export const adminUsersWithStalls = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT 
//          r.user_email,
//          MAX(r.business_name) as business_name,
//          MAX(r.phone_number) as phone_number,
//          MAX(r.address) as address,
//          COUNT(s.id) as stall_count,
//          JSON_ARRAYAGG(JSON_OBJECT('stallId', s.id, 'stallName', s.name, 'qrUrl', rs.qr_url)) as stalls
//        FROM reservations r
//        JOIN reservation_stalls rs ON r.id = rs.reservation_id
//        JOIN stalls s ON rs.stall_id = s.id
//        WHERE r.status = 'active'
//        GROUP BY r.user_email
//        ORDER BY stall_count DESC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch users with stalls", error: err.message });
//   }
// };

// // --- Admin: get reserver details for a stall (used when clicking on a reserved stall in the map) ---
// export const getReserverByStall = async (req, res) => {
//   try {
//     const { id } = req.params; // stall id
//     // Find the active reservation that contains this stall
//     const [rows] = await pool.query(
//       `SELECT r.id as reservation_id, r.user_email, r.business_name, r.phone_number, r.address, r.status, r.created_at
//        FROM reservations r
//        JOIN reservation_stalls rs ON r.id = rs.reservation_id
//        WHERE rs.stall_id = ? AND r.status = 'active' LIMIT 1`,
//       [id]
//     );
//     if (rows.length === 0) return res.status(404).json({ message: 'No active reservation found for this stall' });

//     const reservation = rows[0];
//     // Get all stall names (and QR URLs) for that reservation
//     const [stalls] = await pool.query(
//       `SELECT s.id, s.name, rs.qr_url FROM stalls s JOIN reservation_stalls rs ON s.id = rs.stall_id WHERE rs.reservation_id = ?`,
//       [reservation.reservation_id]
//     );

//     res.json({ ...reservation, stalls });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch reserver details', error: err.message });
//   }
// };

// export default {
//   reserveStalls,
//   getUserReservations,
//   adminUsersWithStalls,
//   getReserverByStall,
// };

import { generateAndUploadQR } from "../services/qrService.js";
import { sendReservationEmail } from "../services/emailService.js";
import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// ✅ Fetch all stalls
export const getStalls = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, size, map_position, is_reserved FROM stalls ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch stalls",
      error: err.message,
    });
  }
};

// ✅ Reserve stalls (Firebase QR + Email)
export const reserveStalls = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { reservationId, email, stalls, publisherName } = req.body;
    console.log("🟢 Received reservation:", {
      reservationId,
      email,
      stalls,
      publisherName,
    });

    // 🔹 Mark stalls as reserved in DB
    const placeholders = stalls.map(() => "?").join(",");
    await conn.query(
      `UPDATE stalls SET is_reserved = 1 WHERE id IN (${placeholders})`,
      stalls
    );

    // 🔹 Generate QR and upload to Firebase
    const qrUrl = await generateAndUploadQR(reservationId, email, publisherName);

    // 🔹 Send email with QR code
    await sendReservationEmail(
      email,
      { id: reservationId, stalls, publisherName },
      qrUrl
    );

    res.status(200).json({
      message: "Reservation confirmed, QR uploaded & email sent!",
      qrUrl,
    });
  } catch (err) {
    console.error("❌ Reservation failed:", err);
    res.status(500).json({
      message: "Failed to process reservation",
      error: err.message,
    });
  } finally {
    conn.release();
  }
};

// ✅ Get user’s reservations
export const getUserReservations = async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await pool.query(
      `SELECT 
         r.id,
         r.user_email,
         r.business_name,
         r.phone_number,
         r.address,
         r.status,
         r.created_at,
         JSON_ARRAYAGG(JSON_OBJECT('stallId', s.id, 'stallName', s.name, 'qrUrl', rs.qr_url)) as stalls
       FROM reservations r
       JOIN reservation_stalls rs ON r.id = rs.reservation_id
       JOIN stalls s ON rs.stall_id = s.id
       WHERE r.user_email = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [email]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch user reservations",
      error: err.message,
    });
  }
};

// ✅ Admin: all users with stalls
export const adminUsersWithStalls = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.user_email,
         MAX(r.business_name) as business_name,
         MAX(r.phone_number) as phone_number,
         MAX(r.address) as address,
         COUNT(s.id) as stall_count,
         JSON_ARRAYAGG(JSON_OBJECT('stallId', s.id, 'stallName', s.name, 'qrUrl', rs.qr_url)) as stalls
       FROM reservations r
       JOIN reservation_stalls rs ON r.id = rs.reservation_id
       JOIN stalls s ON rs.stall_id = s.id
       WHERE r.status = 'active'
       GROUP BY r.user_email
       ORDER BY stall_count DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch users with stalls",
      error: err.message,
    });
  }
};

// ✅ Admin: reserver details for one stall
export const getReserverByStall = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.id as reservation_id, r.user_email, r.business_name, 
              r.phone_number, r.address, r.status, r.created_at
       FROM reservations r
       JOIN reservation_stalls rs ON r.id = rs.reservation_id
       WHERE rs.stall_id = ? AND r.status = 'active' LIMIT 1`,
      [id]
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "No active reservation found for this stall" });

    const reservation = rows[0];
    const [stalls] = await pool.query(
      `SELECT s.id, s.name, rs.qr_url 
       FROM stalls s 
       JOIN reservation_stalls rs ON s.id = rs.stall_id 
       WHERE rs.reservation_id = ?`,
      [reservation.reservation_id]
    );

    res.json({ ...reservation, stalls });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch reserver details",
      error: err.message,
    });
  }
};

export default {
  reserveStalls,
  getUserReservations,
  adminUsersWithStalls,
  getReserverByStall,
};
