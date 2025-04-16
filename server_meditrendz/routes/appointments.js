const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.*, ' +
      'CONCAT(p_user.FirstName, " ", p_user.LastName) AS PatientName, ' +
      'CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName ' +
      'FROM Appointment a ' +
      'JOIN Patient p ON a.PatientID = p.PatientID ' +
      'JOIN User p_user ON p.UserID = p_user.UserID ' +
      'JOIN Doctor d ON a.DoctorID = d.DoctorID ' +
      'JOIN User d_user ON d.UserID = d_user.UserID ' +
      'ORDER BY a.AppointmentDate DESC, a.StartTime DESC'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.*, ' +
      'CONCAT(p_user.FirstName, " ", p_user.LastName) AS PatientName, ' +
      'CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName ' +
      'FROM Appointment a ' +
      'JOIN Patient p ON a.PatientID = p.PatientID ' +
      'JOIN User p_user ON p.UserID = p_user.UserID ' +
      'JOIN Doctor d ON a.DoctorID = d.DoctorID ' +
      'JOIN User d_user ON d.UserID = d_user.UserID ' +
      'WHERE a.AppointmentID = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  const { 
    patientId, doctorId, appointmentType, appointmentDate, 
    startTime, endTime, notes 
  } = req.body;
  
  // Validate input
  if (!patientId || !doctorId || !appointmentType || !appointmentDate || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  try {
    // Check if doctor is available at this time
    const [existingAppointments] = await db.query(
      'SELECT * FROM Appointment WHERE DoctorID = ? AND AppointmentDate = ? ' +
      'AND ((StartTime <= ? AND EndTime > ?) OR (StartTime < ? AND EndTime >= ?) OR (StartTime >= ? AND EndTime <= ?))',
      [
        doctorId, appointmentDate, 
        startTime, startTime, 
        endTime, endTime, 
        startTime, endTime
      ]
    );
    
    if (existingAppointments.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor is not available at the selected time' 
      });
    }
    
    // Create the appointment
    const [result] = await db.query(
      'INSERT INTO Appointment (PatientID, DoctorID, AppointmentType, AppointmentDate, StartTime, EndTime, Status, Notes) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, appointmentType, appointmentDate, startTime, endTime, 'Scheduled', notes]
    );
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: result.insertId
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  
  try {
    const [result] = await db.query(
      'UPDATE Appointment SET Status = ? WHERE AppointmentID = ?',
      [status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/patient/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.*, ' +
      'CONCAT(d_user.FirstName, " ", d_user.LastName) AS DoctorName ' +
      'FROM Appointment a ' +
      'JOIN Doctor d ON a.DoctorID = d.DoctorID ' +
      'JOIN User d_user ON d.UserID = d_user.UserID ' +
      'WHERE a.PatientID = ? ' +
      'ORDER BY a.AppointmentDate DESC, a.StartTime DESC',
      [req.params.id]
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error fetching appointments for patient ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;