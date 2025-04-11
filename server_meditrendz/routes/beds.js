// routes/beds.js (backend)
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all room types
router.get('/room-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM RoomType');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all rooms with occupancy information
router.get('/rooms', async (req, res) => {
  try {
    const [rooms] = await db.query(
      'SELECT r.*, rt.Name as RoomTypeName, rt.DailyRate, ' +
      '(SELECT COUNT(*) FROM Bed b WHERE b.RoomID = r.RoomID) as TotalBeds, ' +
      '(SELECT COUNT(*) FROM Bed b WHERE b.RoomID = r.RoomID AND b.Status = "Occupied") as OccupiedBeds ' +
      'FROM Room r ' +
      'JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID ' +
      'ORDER BY r.Floor, r.RoomNumber'
    );
    
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all beds with status and patient info if occupied
router.get('/beds', async (req, res) => {
  try {
    const [beds] = await db.query(
      'SELECT b.*, r.RoomNumber, rt.Name as RoomTypeName, rt.DailyRate, ' +
      'ba.AssignmentID, ba.AdmissionID, pa.PatientID, ' +
      'CONCAT(u.FirstName, " ", u.LastName) as PatientName, ' +
      'pa.AdmissionDate, pa.AdmissionReason, ' +
      'CONCAT(du.FirstName, " ", du.LastName) as DoctorName ' +
      'FROM Bed b ' +
      'JOIN Room r ON b.RoomID = r.RoomID ' +
      'JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID ' +
      'LEFT JOIN BedAssignment ba ON b.BedID = ba.BedID AND ba.Status = "Current" ' +
      'LEFT JOIN PatientAdmission pa ON ba.AdmissionID = pa.AdmissionID ' +
      'LEFT JOIN Patient p ON pa.PatientID = p.PatientID ' +
      'LEFT JOIN User u ON p.UserID = u.UserID ' +
      'LEFT JOIN Doctor d ON pa.AdmittingDoctorID = d.DoctorID ' +
      'LEFT JOIN User du ON d.UserID = du.UserID ' +
      'ORDER BY r.Floor, r.RoomNumber, b.BedNumber'
    );
    
    res.json({ success: true, data: beds });
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get available beds (for admission)
router.get('/beds/available', async (req, res) => {
  try {
    const [beds] = await db.query(
      'SELECT b.BedID, b.BedNumber, r.RoomNumber, r.Floor, rt.Name as RoomTypeName, rt.DailyRate ' +
      'FROM Bed b ' +
      'JOIN Room r ON b.RoomID = r.RoomID ' +
      'JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID ' +
      'WHERE b.Status = "Available" ' +
      'ORDER BY r.Floor, r.RoomNumber, b.BedNumber'
    );
    
    res.json({ success: true, data: beds });
  } catch (error) {
    console.error('Error fetching available beds:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current admissions
router.get('/admissions', async (req, res) => {
  try {
    const [admissions] = await db.query(
      'SELECT pa.*, ' +
      'CONCAT(pu.FirstName, " ", pu.LastName) as PatientName, ' +
      'CONCAT(du.FirstName, " ", du.LastName) as DoctorName, ' +
      'b.BedID, b.BedNumber, r.RoomID, r.RoomNumber, r.Floor, ' +
      'rt.Name as RoomTypeName, rt.DailyRate ' +
      'FROM PatientAdmission pa ' +
      'JOIN Patient p ON pa.PatientID = p.PatientID ' +
      'JOIN User pu ON p.UserID = pu.UserID ' +
      'JOIN Doctor d ON pa.AdmittingDoctorID = d.DoctorID ' +
      'JOIN User du ON d.UserID = du.UserID ' +
      'LEFT JOIN BedAssignment ba ON pa.AdmissionID = ba.AdmissionID AND ba.Status = "Current" ' +
      'LEFT JOIN Bed b ON ba.BedID = b.BedID ' +
      'LEFT JOIN Room r ON b.RoomID = r.RoomID ' +
      'LEFT JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID ' +
      'WHERE pa.Status = "Admitted" ' +
      'ORDER BY pa.AdmissionDate DESC'
    );
    
    res.json({ success: true, data: admissions });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get admission by ID
router.get('/admissions/:id', async (req, res) => {
  try {
    const [admissions] = await db.query(
      'SELECT pa.*, ' +
      'CONCAT(pu.FirstName, " ", pu.LastName) as PatientName, ' +
      'CONCAT(du.FirstName, " ", du.LastName) as DoctorName, ' +
      'b.BedID, b.BedNumber, r.RoomID, r.RoomNumber, r.Floor, ' +
      'rt.Name as RoomTypeName, rt.DailyRate ' +
      'FROM PatientAdmission pa ' +
      'JOIN Patient p ON pa.PatientID = p.PatientID ' +
      'JOIN User pu ON p.UserID = pu.UserID ' +
      'JOIN Doctor d ON pa.AdmittingDoctorID = d.DoctorID ' +
      'JOIN User du ON d.UserID = du.UserID ' +
      'LEFT JOIN BedAssignment ba ON pa.AdmissionID = ba.AdmissionID AND ba.Status = "Current" ' +
      'LEFT JOIN Bed b ON ba.BedID = b.BedID ' +
      'LEFT JOIN Room r ON b.RoomID = r.RoomID ' +
      'LEFT JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID ' +
      'WHERE pa.AdmissionID = ?',
      [req.params.id]
    );
    
    if (admissions.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    
    res.json({ success: true, data: admissions[0] });
  } catch (error) {
    console.error(`Error fetching admission with ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admit a patient (create admission and assign bed)
router.post('/admissions', async (req, res) => {
  const { 
    patientId, 
    doctorId, 
    admissionReason, 
    diagnosisAtAdmission, 
    bedId, 
    notes 
  } = req.body;
  
  // Validate input
  if (!patientId || !doctorId || !admissionReason || !bedId) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Check if bed is available
    const [bedCheck] = await conn.query(
      'SELECT * FROM Bed WHERE BedID = ? AND Status = "Available"',
      [bedId]
    );
    
    if (bedCheck.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Selected bed is not available' });
    }
    
    // Create admission record
    const [admissionResult] = await conn.query(
      'INSERT INTO PatientAdmission (PatientID, AdmittingDoctorID, AdmissionDate, AdmissionReason, DiagnosisAtAdmission, Status) ' +
      'VALUES (?, ?, NOW(), ?, ?, "Admitted")',
      [patientId, doctorId, admissionReason, diagnosisAtAdmission]
    );
    
    const admissionId = admissionResult.insertId;
    
    // Assign bed
    await conn.query(
      'INSERT INTO BedAssignment (AdmissionID, BedID, AssignedFrom, AssignedBy, Status, Notes) ' +
      'VALUES (?, ?, NOW(), ?, "Current", ?)',
      [admissionId, bedId, doctorId, notes]
    );
    
    // Update bed status
    await conn.query(
      'UPDATE Bed SET Status = "Occupied" WHERE BedID = ?',
      [bedId]
    );
    
    await conn.commit();
    
    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      admissionId: admissionId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error admitting patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Discharge a patient
router.post('/admissions/:id/discharge', async (req, res) => {
  const { notes, dischargeRemarks, userId } = req.body;
  const admissionId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required for tracking who performed the discharge' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Update admission record
    const [updateResult] = await conn.query(
      'UPDATE PatientAdmission SET DischargeDate = NOW(), Status = "Discharged", DischargeRemarks = ? ' +
      'WHERE AdmissionID = ? AND Status = "Admitted"',
      [dischargeRemarks || '', admissionId]
    );
    
    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Active admission not found' });
    }
    
    // Get current bed assignment
    const [bedAssignments] = await conn.query(
      'SELECT ba.*, b.BedID FROM BedAssignment ba ' +
      'JOIN Bed b ON ba.BedID = b.BedID ' +
      'WHERE ba.AdmissionID = ? AND ba.Status = "Current"',
      [admissionId]
    );
    
    if (bedAssignments.length > 0) {
      const assignment = bedAssignments[0];
      
      // Close bed assignment
      await conn.query(
        'UPDATE BedAssignment SET AssignedTo = NOW(), Status = "Previous", Notes = CONCAT(Notes, ?) ' +
        'WHERE AssignmentID = ?',
        [notes ? `\nDischarge notes: ${notes}` : '', assignment.AssignmentID]
      );
      
      // Update bed status
      await conn.query(
        'UPDATE Bed SET Status = "Available" WHERE BedID = ?',
        [assignment.BedID]
      );
    }
    
    await conn.commit();
    
    res.json({
      success: true,
      message: 'Patient discharged successfully'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error discharging patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Transfer a patient to another bed
router.post('/admissions/:id/transfer', async (req, res) => {
  const { newBedId, transferReason, userId } = req.body;
  const admissionId = req.params.id;
  
  if (!newBedId || !userId) {
    return res.status(400).json({ success: false, message: 'New bed ID and user ID are required' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Check if new bed is available
    const [bedCheck] = await conn.query(
      'SELECT * FROM Bed WHERE BedID = ? AND Status = "Available"',
      [newBedId]
    );
    
    if (bedCheck.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Selected bed is not available' });
    }
    
    // Get current bed assignment
    const [currentAssignments] = await conn.query(
      'SELECT * FROM BedAssignment WHERE AdmissionID = ? AND Status = "Current"',
      [admissionId]
    );
    
    if (currentAssignments.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'No current bed assignment found' });
    }
    
    const currentAssignment = currentAssignments[0];
    const currentBedId = currentAssignment.BedID;
    
    // Update current assignment to previous
    await conn.query(
      'UPDATE BedAssignment SET AssignedTo = NOW(), Status = "Previous", ' +
      'Notes = CONCAT(Notes, ?) WHERE AssignmentID = ?',
      [transferReason ? `\nTransfer reason: ${transferReason}` : '\nTransferred to another bed', currentAssignment.AssignmentID]
    );
    
    // Create new bed assignment
    await conn.query(
      'INSERT INTO BedAssignment (AdmissionID, BedID, AssignedFrom, AssignedBy, Status, Notes) ' +
      'VALUES (?, ?, NOW(), ?, "Current", ?)',
      [admissionId, newBedId, userId, `Transferred from bed ${currentBedId}`]
    );
    
    // Update old bed status
    await conn.query(
      'UPDATE Bed SET Status = "Available" WHERE BedID = ?',
      [currentBedId]
    );
    
    // Update new bed status
    await conn.query(
      'UPDATE Bed SET Status = "Occupied" WHERE BedID = ?',
      [newBedId]
    );
    
    await conn.commit();
    
    res.json({
      success: true,
      message: 'Patient transferred successfully'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error transferring patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Add a new room
router.post('/rooms', async (req, res) => {
  const { roomNumber, roomTypeId, floor, wing, capacity, notes } = req.body;
  
  if (!roomNumber || !roomTypeId || !floor || !capacity) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Check if room number already exists
    const [existingRooms] = await conn.query(
      'SELECT * FROM Room WHERE RoomNumber = ?',
      [roomNumber]
    );
    
    if (existingRooms.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }
    
    // Insert room
    const [roomResult] = await conn.query(
      'INSERT INTO Room (RoomNumber, RoomTypeID, Floor, Wing, Capacity, Status, Notes) ' +
      'VALUES (?, ?, ?, ?, ?, "Available", ?)',
      [roomNumber, roomTypeId, floor, wing, capacity, notes]
    );
    
    const roomId = roomResult.insertId;
    
    // Automatically create beds for this room
    for (let i = 1; i <= capacity; i++) {
      await conn.query(
        'INSERT INTO Bed (RoomID, BedNumber, Status) VALUES (?, ?, "Available")',
        [roomId, `${roomNumber}-${i}`]
      );
    }
    
    await conn.commit();
    
    res.status(201).json({
      success: true,
      message: 'Room and beds added successfully',
      roomId: roomId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error adding room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Add a new room type
router.post('/room-types', async (req, res) => {
  const { name, description, dailyRate } = req.body;
  
  if (!name || !dailyRate) {
    return res.status(400).json({ success: false, message: 'Name and daily rate are required' });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO RoomType (Name, Description, DailyRate) VALUES (?, ?, ?)',
      [name, description, dailyRate]
    );
    
    res.status(201).json({
      success: true,
      message: 'Room type added successfully',
      roomTypeId: result.insertId
    });
  } catch (error) {
    console.error('Error adding room type:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;