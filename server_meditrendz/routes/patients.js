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

// Get all patients
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.PatientID, u.FirstName, u.LastName, p.DateOfBirth, p.Gender,
             u.Email, u.PhoneNumber, p.Address, p.BloodGroup,
             p.EmergencyContactName, p.EmergencyContactNumber
      FROM Patient p
      JOIN User u ON p.UserID = u.UserID
    `;
    const patients = await executeQuery(query);
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT p.PatientID, u.FirstName, u.LastName, p.DateOfBirth, p.Gender,
             u.Email, u.PhoneNumber, p.Address, p.BloodGroup, p.MedicalHistory, p.Allergies,
             p.EmergencyContactName, p.EmergencyContactNumber, p.EmergencyContactRelation
      FROM Patient p
      JOIN User u ON p.UserID = u.UserID
      WHERE p.PatientID = ?
    `;
    const patient = await executeQuery(query, [req.params.id]);

    if (!patient.length) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Patient
router.put('/:id', async (req, res) => {
  const {
    firstName, lastName, phoneNumber, dateOfBirth, gender, bloodGroup, height, weight,
    address, allergies, medicalHistory,
    emergencyContactName, emergencyContactNumber, emergencyContactRelation
  } = req.body;

  try {
    const patientQuery = 'SELECT UserID FROM Patient WHERE PatientID = ?';
    const patients = await executeQuery(patientQuery, [req.params.id]);

    if (!patients.length) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const userId = patients[0].UserID;

    const userUpdateQuery = `
      UPDATE User SET FirstName = ?, LastName = ?, PhoneNumber = ? 
      WHERE UserID = ?
    `;
    await executeQuery(userUpdateQuery, [firstName, lastName, phoneNumber, userId]);

    const patientUpdateQuery = `
      UPDATE Patient SET DateOfBirth = ?, Gender = ?, BloodGroup = ?, Height = ?, Weight = ?, 
                         Address = ?, Allergies = ?, MedicalHistory = ?, 
                         EmergencyContactName = ?, EmergencyContactNumber = ?, EmergencyContactRelation = ?
      WHERE PatientID = ?
    `;
    await executeQuery(patientUpdateQuery, [
      dateOfBirth, gender, bloodGroup, height, weight,
      address, allergies, medicalHistory,
      emergencyContactName, emergencyContactNumber, emergencyContactRelation,
      req.params.id
    ]);

    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register a new patient using stored procedure
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, dateOfBirth, gender,
    bloodGroup, height, weight, address, allergies, medicalHistory,
    emergencyContactName, emergencyContactNumber, emergencyContactRelation } = req.body;

  if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  try {
    const existingUserQuery = 'SELECT * FROM User WHERE Email = ?';
    const existingUsers = await executeQuery(existingUserQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    try {
      await executeQuery(`
        CALL addPatientProcedure(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @patientId)
      `, [
        email, password, firstName, lastName, phoneNumber || null,
        dateOfBirth, gender, bloodGroup || null, height || null, weight || null,
        address || null, medicalHistory || null, allergies || null,
        emergencyContactName || null, emergencyContactNumber || null, emergencyContactRelation || null
      ]);

      const output = await executeQuery('SELECT @patientId AS patientId');

      if (output.length && output[0].patientId > 0) {
        res.status(201).json({
          success: true,
          message: 'Patient created successfully',
          patientId: output[0].patientId
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create patient - procedure did not return a valid ID'
        });
      }
    } catch (procError) {
      console.error('Error executing stored procedure:', procError);
      res.status(500).json({
        success: false,
        message: 'Error in stored procedure execution',
        error: procError.message
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;