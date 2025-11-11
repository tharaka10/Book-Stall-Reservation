// backend/controllers/reservationController.js
import { generateAndUploadQR } from "../services/qrService.js";
import { sendReservationEmail } from "../services/emailService.js";
import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Contract (inputs/outputs)
// - getStalls: returns list of stalls with is_reserved flag
// - reserveStalls: body { email, publisherName, stallIds: [int] } -> creates reservation and returns reservationId + qrUrl
// - max 3 stalls per user enforced across active reservations

export const getStalls = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, size, map_position, is_reserved FROM stalls ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stalls", error: err.message });
  }
};

export const reserveStalls = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, publisherName, stallIds } = req.body;
    if (!email || !Array.isArray(stallIds) || stallIds.length === 0) {
      return res.status(400).json({ message: "Invalid request: email and stallIds required" });
    }

    if (stallIds.length > 3) {
      return res.status(400).json({ message: "Cannot reserve more than 3 stalls in one reservation" });
    }

    await conn.beginTransaction();

    // Count currently reserved stalls for this user (active reservations)
    const [countRows] = await conn.query(
      `SELECT COALESCE(SUM(rs.count),0) as total FROM (
        SELECT COUNT(*) as count FROM reservation_stalls rs
        JOIN reservations r ON rs.reservation_id = r.id
        WHERE r.user_email = ? AND r.status = 'active'
      ) as rs`,
      [email]
    );
    const currentCount = countRows[0].total || 0;
    if (currentCount + stallIds.length > 3) {
      await conn.rollback();
      return res.status(400).json({ message: `Reservation would exceed max 3 stalls per user (you already have ${currentCount})` });
    }

    // Lock the stalls rows for update and ensure availability
    const placeholders = stallIds.map(() => '?').join(',');
    const [stalls] = await conn.query(
      `SELECT id, name, is_reserved FROM stalls WHERE id IN (${placeholders}) FOR UPDATE`,
      stallIds
    );

    const unavailable = stalls.filter(s => s.is_reserved);
    if (unavailable.length > 0 || stalls.length !== stallIds.length) {
      await conn.rollback();
      return res.status(400).json({ message: "One or more requested stalls are not available", unavailable });
    }

    const reservationId = uuidv4();
    // Insert reservation
    await conn.query(
      `INSERT INTO reservations (id, user_email, publisher_name, status) VALUES (?,?,?, 'active')`,
      [reservationId, email, publisherName]
    );

    // Insert reservation_stalls and mark stalls reserved
    for (const stallId of stallIds) {
      await conn.query(
        `INSERT INTO reservation_stalls (reservation_id, stall_id) VALUES (?,?)`,
        [reservationId, stallId]
      );
    }

    await conn.query(
      `UPDATE stalls SET is_reserved = 1 WHERE id IN (${placeholders})`,
      stallIds
    );

    await conn.commit();

    // Generate QR and send email (outside DB transaction)
    const qrUrl = await generateAndUploadQR(reservationId, email);
    // Fetch stall names for email
    const [reservedStalls] = await pool.query(
      `SELECT name FROM stalls WHERE id IN (${placeholders})`,
      stallIds
    );
    const stallNames = reservedStalls.map(s => s.name);
    await sendReservationEmail(email, { id: reservationId, stalls: stallNames, publisherName }, qrUrl);

    res.status(201).json({ message: "Reservation successful", reservationId, qrUrl });
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) {}
    res.status(500).json({ message: "Failed to create reservation", error: err.message });
  } finally {
    conn.release();
  }
};

export const getUserReservations = async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await pool.query(
      `SELECT r.id, r.user_email, r.publisher_name, r.status, r.created_at,
        JSON_ARRAYAGG(s.name) as stalls
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
    res.status(500).json({ message: "Failed to fetch user reservations", error: err.message });
  }
};

// --- Admin: list users with their reserved stalls ---
export const adminUsersWithStalls = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.user_email, r.publisher_name, GROUP_CONCAT(s.name SEPARATOR ', ') as stalls, COUNT(s.id) as stall_count
       FROM reservations r
       JOIN reservation_stalls rs ON r.id = rs.reservation_id
       JOIN stalls s ON rs.stall_id = s.id
       WHERE r.status = 'active'
       GROUP BY r.user_email, r.publisher_name
       ORDER BY stall_count DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users with stalls", error: err.message });
  }
};

// --- Admin: get reserver details for a stall (used when clicking on a reserved stall in the map) ---
export const getReserverByStall = async (req, res) => {
  try {
    const { id } = req.params; // stall id
    // Find the active reservation that contains this stall
    const [rows] = await pool.query(
      `SELECT r.id as reservation_id, r.user_email, r.publisher_name, r.status, r.created_at
       FROM reservations r
       JOIN reservation_stalls rs ON r.id = rs.reservation_id
       WHERE rs.stall_id = ? AND r.status = 'active' LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No active reservation found for this stall' });

    const reservation = rows[0];
    // Get all stall names for that reservation
    const [stalls] = await pool.query(
      `SELECT s.id, s.name FROM stalls s JOIN reservation_stalls rs ON s.id = rs.stall_id WHERE rs.reservation_id = ?`,
      [reservation.reservation_id]
    );

    res.json({ ...reservation, stalls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch reserver details', error: err.message });
  }
};

export default {
  reserveStalls,
  getUserReservations,
  adminUsersWithStalls,
  getReserverByStall,
};
