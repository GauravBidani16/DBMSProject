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

// Get all beds with status and patient info if patient is admitted
router.get('/beds', async (req, res) => {
  try {
    const query = `
      SELECT b.*, r.RoomNumber, rt.Name AS RoomTypeName, rt.DailyRate,
             ba.AssignmentID, ba.AdmissionID, pa.PatientID,
             CONCAT(u.FirstName, " ", u.LastName) AS PatientName, 
             pa.AdmissionDate, pa.AdmissionReason,
             CONCAT(du.FirstName, " ", du.LastName) AS DoctorName
      FROM Bed b
      JOIN Room r ON b.RoomID = r.RoomID
      JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      LEFT JOIN BedAssignment ba ON b.BedID = ba.BedID AND ba.Status = "Current"
      LEFT JOIN PatientAdmission pa ON ba.AdmissionID = pa.AdmissionID
      LEFT JOIN Patient p ON pa.PatientID = p.PatientID
      LEFT JOIN User u ON p.UserID = u.UserID
      LEFT JOIN Doctor d ON pa.AdmittingDoctorID = d.DoctorID
      LEFT JOIN User du ON d.UserID = du.UserID
      ORDER BY r.Floor, r.RoomNumber, b.BedNumber`;
    const beds = await executeQuery(query);
    res.json({ success: true, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current admissions
router.get('/admissions', async (req, res) => {
  try {
    const query =
      `SELECT pa.*,
      CONCAT(pu.FirstName, " ", pu.LastName) as PatientName,
      CONCAT(du.FirstName, " ", du.LastName) as DoctorName,
      b.BedID, b.BedNumber, r.RoomID, r.RoomNumber, r.Floor,
      rt.Name as RoomTypeName, rt.DailyRate
      FROM PatientAdmission pa
      JOIN Patient p ON pa.PatientID = p.PatientID
      JOIN User pu ON p.UserID = pu.UserID
      JOIN Doctor d ON pa.AdmittingDoctorID = d.DoctorID
      JOIN User du ON d.UserID = du.UserID
      LEFT JOIN BedAssignment ba ON pa.AdmissionID = ba.AdmissionID AND ba.Status = "Current"
      LEFT JOIN Bed b ON ba.BedID = b.BedID
      LEFT JOIN Room r ON b.RoomID = r.RoomID
      LEFT JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE pa.Status = "Admitted"
      ORDER BY pa.AdmissionDate DESC`;

    const admissions = await executeQuery(query);
    res.json({ success: true, data: admissions });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get available beds
router.get('/beds/available', async (req, res) => {
  try {
    const query = `
      SELECT b.BedID, b.BedNumber, r.RoomNumber, r.Floor, rt.Name AS RoomTypeName, rt.DailyRate
      FROM Bed b
      JOIN Room r ON b.RoomID = r.RoomID
      JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE b.Status = "Available"
      ORDER BY r.Floor, r.RoomNumber, b.BedNumber
    `;
    const beds = await executeQuery(query);
    res.json({ success: true, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admit a patient
router.post('/admissions', async (req, res) => {
  const { patientId, doctorId, admissionReason, diagnosisAtAdmission, bedId, notes } = req.body;
  if (!patientId || !doctorId || !admissionReason || !bedId) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const bedCheckQuery = `SELECT * FROM Bed WHERE BedID = ? AND Status = "Available"`;
    const bedCheck = await executeQuery(bedCheckQuery, [bedId]);

    if (bedCheck.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Selected bed is not available' });
    }

    const admissionQuery = `
      INSERT INTO PatientAdmission (PatientID, AdmittingDoctorID, AdmissionDate, AdmissionReason, DiagnosisAtAdmission, Status)
      VALUES (?, ?, NOW(), ?, ?, "Admitted")
    `;
    const admissionResult = await executeQuery(admissionQuery, [patientId, doctorId, admissionReason, diagnosisAtAdmission]);
    const admissionId = admissionResult.insertId;

    await executeQuery(`
      INSERT INTO BedAssignment (AdmissionID, BedID, AssignedFrom, AssignedBy, Status, Notes)
      VALUES (?, ?, NOW(), ?, "Current", ?)
    `, [admissionId, bedId, doctorId, notes]);

    await executeQuery(`UPDATE Bed SET Status = "Occupied" WHERE BedID = ?`, [bedId]);

    await conn.commit();
    res.status(201).json({ success: true, message: 'Patient admitted successfully', admissionId });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

// Discharge a patient
router.post('/admissions/:id/discharge', async (req, res) => {
  const { notes,userId } = req.body;
  const admissionId = req.params.id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required for tracking who performed the discharge' });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const dischargeQuery = `
      UPDATE PatientAdmission SET DischargeDate = NOW(), Status = "Discharged"
      WHERE AdmissionID = ? AND Status = "Admitted"
    `;
    const updateResult = await executeQuery(dischargeQuery, [admissionId]);

    if (!updateResult.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Active admission not found' });
    }

    const bedAssignmentQuery = `
      SELECT ba.AssignmentID, b.BedID FROM BedAssignment ba
      JOIN Bed b ON ba.BedID = b.BedID
      WHERE ba.AdmissionID = ? AND ba.Status = "Current"
    `;
    const bedAssignments = await executeQuery(bedAssignmentQuery, [admissionId]);

    if (bedAssignments.length > 0) {
      const assignment = bedAssignments[0];

      await executeQuery(`
        UPDATE BedAssignment SET AssignedTo = NOW(), Status = "Previous", Notes = CONCAT(Notes, ?)
        WHERE AssignmentID = ?
      `, [notes ? `\nDischarge notes: ${notes}` : '', assignment.AssignmentID]);

      await executeQuery(`UPDATE Bed SET Status = "Available" WHERE BedID = ?`, [assignment.BedID]);
    }

    await conn.commit();
    res.json({ success: true, message: 'Patient discharged successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;