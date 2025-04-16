const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT d.DoctorID, u.FirstName, u.LastName, d.Specialization, d.LicenseNumber, ' +
      'dep.Name as Department, d.ConsultationFee, u.Email, u.PhoneNumber, u.IsActive ' +
      'FROM Doctor d ' +
      'JOIN User u ON d.UserID = u.UserID ' +
      'JOIN Department dep ON d.DepartmentID = dep.DepartmentID'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/department', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Department ORDER BY Name');
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT d.DoctorID, u.FirstName, u.LastName, d.Specialization, d.LicenseNumber, ' +
      'dep.Name as Department, d.ConsultationFee, u.Email, u.PhoneNumber, u.IsActive, ' +
      'd.Qualification ' +
      'FROM Doctor d ' +
      'JOIN User u ON d.UserID = u.UserID ' +
      'JOIN Department dep ON d.DepartmentID = dep.DepartmentID ' +
      'WHERE d.DoctorID = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    // Get doctor's schedule
    const [schedules] = await db.query(
      'SELECT * FROM DoctorSchedule WHERE DoctorID = ?',
      [req.params.id]
    );
    
    const doctor = rows[0];
    doctor.schedules = schedules;
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new doctor (admin only)
// router.post('/', async (req, res) => {
//   const { 
//     email, password, firstName, lastName, specialization, 
//     licenseNumber, departmentId, consultationFee, qualification, phoneNumber 
//   } = req.body;
  
//   // Validate input
//   if (!email || !password || !firstName || !lastName || !specialization || 
//       !licenseNumber || !departmentId || !consultationFee || !qualification) {
//     return res.status(400).json({ success: false, message: 'Required fields are missing' });
//   }
  
//   const conn = await db.getConnection();
//   await conn.beginTransaction();
  
//   try {
//     // Check if user already exists
//     const [existingUsers] = await conn.query('SELECT * FROM User WHERE Email = ?', [email]);
    
//     if (existingUsers.length > 0) {
//       await conn.rollback();
//       return res.status(400).json({ success: false, message: 'User with this email already exists' });
//     }
    
//     // Insert user
//     const [userResult] = await conn.query(
//       'INSERT INTO User (Email, Password, FirstName, LastName, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?, ?)',
//       [email, password, firstName, lastName, phoneNumber, 'Doctor']
//     );
    
//     const userId = userResult.insertId;
    
//     // Insert doctor
//     const [doctorResult] = await conn.query(
//       'INSERT INTO Doctor (UserID, Specialization, LicenseNumber, DepartmentID, Qualification, ConsultationFee) ' +
//       'VALUES (?, ?, ?, ?, ?, ?)',
//       [userId, specialization, licenseNumber, departmentId, qualification, consultationFee]
//     );
    
//     await conn.commit();
    
//     res.status(201).json({
//       success: true,
//       message: 'Doctor created successfully',
//       doctorId: doctorResult.insertId
//     });
//   } catch (error) {
//     await conn.rollback();
//     console.error('Error creating doctor:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   } finally {
//     conn.release();
//   }
// });

router.post('/', async (req, res) => {
  const { 
    email, password, firstName, lastName, phoneNumber, specialization, 
    licenseNumber, departmentId, consultationFee, qualification 
  } = req.body;
  
  // Validate input
  if (!email || !password || !firstName || !lastName || !specialization || 
      !licenseNumber || !departmentId || !consultationFee) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    
    // Call the function to register the doctor
    const [result] = await db.query(
      'SELECT registerDoctorFunction(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS doctorId',
      [
        email, password, firstName, lastName, phoneNumber || null, 
        specialization, licenseNumber, departmentId, consultationFee,
        qualification || null
      ]
    );
    
    const doctorId = result[0].doctorId;
    
    if (doctorId > 0) {
      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully',
        doctorId: doctorId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register doctor'
      });
    }
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;  