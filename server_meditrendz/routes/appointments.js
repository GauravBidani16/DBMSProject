const express = require('express');
const router = express.Router();
const db = require('../config/db');

const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database error');
  }
};

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT a.*, 
        CONCAT(p_user.FirstName, " ", p_user.LastName) AS PatientName,
        CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName
      FROM Appointment a
      JOIN Patient p ON a.PatientID = p.PatientID
      JOIN User p_user ON p.UserID = p_user.UserID
      JOIN Doctor d ON a.DoctorID = d.DoctorID
      JOIN User d_user ON d.UserID = d_user.UserID
      ORDER BY a.AppointmentDate DESC, a.StartTime DESC
    `;
    const rows = await executeQuery(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment by ID
// router.get('/:id', async (req, res) => {
//   console.log(2);
//   try {
//     const query = `
//       SELECT a.*, 
//         CONCAT(p_user.FirstName, " ", p_user.LastName) AS PatientName,
//         CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName
//       FROM Appointment a
//       JOIN Patient p ON a.PatientID = p.PatientID
//       JOIN User p_user ON p.UserID = p_user.UserID
//       JOIN Doctor d ON a.DoctorID = d.DoctorID
//       JOIN User d_user ON d.UserID = d_user.UserID
//       WHERE a.AppointmentID = ?
//     `;
//     const rows = await executeQuery(query, [req.params.id]);

//     if (!rows.length) {
//       return res.status(404).json({ success: false, message: 'Appointment not found' });
//     }
//     res.json({ success: true, data: rows[0] });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// Create a new appointment
router.post('/', async (req, res) => {
  const { patientId, doctorId, appointmentType, appointmentDate, startTime, endTime, notes } = req.body;

  if (!patientId || !doctorId || !appointmentType || !appointmentDate || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  try {
    // const conflictQuery = `
    //   SELECT * FROM Appointment 
    //   WHERE DoctorID = ? AND AppointmentDate = ? 
    //   AND ((StartTime <= ? AND EndTime > ?) OR 
    //        (StartTime < ? AND EndTime >= ?) OR 
    //        (StartTime >= ? AND EndTime <= ?))
    // `;
    // const conflicts = await executeQuery(conflictQuery, [doctorId, appointmentDate, startTime, startTime, endTime, endTime, startTime, endTime]);

    // if (conflicts.length) {
    //   return res.status(400).json({ success: false, message: 'Doctor is not available at the selected time' });
    // }

    const insertQuery = `
      INSERT INTO Appointment (PatientID, DoctorID, AppointmentType, AppointmentDate, StartTime, EndTime, Status, Notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(insertQuery, [patientId, doctorId, appointmentType, appointmentDate, startTime, endTime, 'Scheduled', notes]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const updateQuery = `UPDATE Appointment SET Status = ? WHERE AppointmentID = ?`;
    const result = await executeQuery(updateQuery, [status, req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointments by patient ID
router.get('/patient/:id', async (req, res) => {

  try {
    const query =
      `SELECT a.*, CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName
      FROM Appointment a
      JOIN Doctor d ON a.DoctorID = d.DoctorID
      JOIN User d_user ON d.UserID = d_user.UserID
      WHERE a.PatientID = ?
      ORDER BY a.AppointmentDate DESC, a.StartTime DESC`;
    const rows = await executeQuery(query, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointments by doctor ID
router.get('/doctor/:id', async (req, res) => {
  try {
    const query = `
      SELECT a.*, CONCAT(p_user.FirstName, " ", p_user.LastName) AS PatientName
      FROM Appointment a
      JOIN Patient p ON a.PatientID = p.PatientID
      JOIN User p_user ON p.UserID = p_user.UserID
      WHERE a.DoctorID = ?
      ORDER BY a.AppointmentDate ASC, a.StartTime ASC
    `;
    const rows = await executeQuery(query, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;