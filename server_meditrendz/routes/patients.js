const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.PatientID, u.FirstName, u.LastName, p.DateOfBirth, p.Gender, ' +
      'u.Email, u.PhoneNumber, p.Address, p.BloodGroup, ' +
      'p.EmergencyContactName, p.EmergencyContactNumber ' +
      'FROM Patient p ' +
      'JOIN User u ON p.UserID = u.UserID'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.PatientID, u.FirstName, u.LastName, p.DateOfBirth, p.Gender, ' +
      'u.Email, u.PhoneNumber, p.Address, p.BloodGroup, p.MedicalHistory, p.Allergies, ' +
      'p.EmergencyContactName, p.EmergencyContactNumber, p.EmergencyContactRelation ' +
      'FROM Patient p ' +
      'JOIN User u ON p.UserID = u.UserID ' +
      'WHERE p.PatientID = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  const { 
    address, bloodGroup, medicalHistory, allergies, 
    emergencyContactName, emergencyContactNumber, emergencyContactRelation 
  } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE Patient SET Address = ?, BloodGroup = ?, MedicalHistory = ?, Allergies = ?, ' +
      'EmergencyContactName = ?, EmergencyContactNumber = ?, EmergencyContactRelation = ? ' +
      'WHERE PatientID = ?',
      [
        address, bloodGroup, medicalHistory, allergies, 
        emergencyContactName, emergencyContactNumber, emergencyContactRelation,
        req.params.id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;