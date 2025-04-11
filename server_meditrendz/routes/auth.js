const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  
  try {
    // For now, we'll use plaintext password comparison as requested
    // In a production environment, you should use bcrypt.compare
    const [rows] = await db.query(
      'SELECT User.*, Doctor.DoctorID, Patient.PatientID, Admin.AdminID FROM User ' +
      'LEFT JOIN Doctor ON User.UserID = Doctor.UserID ' +
      'LEFT JOIN Patient ON User.UserID = Patient.UserID ' +
      'LEFT JOIN Admin ON User.UserID = Admin.UserID ' +
      'WHERE Email = ? AND Password = ?',
      [email, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Remove password from response
    delete user.Password;
    
    res.json({
      success: true,
      user: {
        id: user.UserID,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role,
        doctorId: user.DoctorID || null,
        patientId: user.PatientID || null,
        adminId: user.AdminID || null,
        isActive: user.IsActive === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register route for patients (simplified for now)
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, dateOfBirth, gender, phoneNumber } = req.body;
  
  if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    
    // Begin transaction
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // Insert user
      const [userResult] = await conn.query(
        'INSERT INTO User (Email, Password, FirstName, LastName, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, password, firstName, lastName, phoneNumber, 'Patient']
      );
      
      const userId = userResult.insertId;
      
      // Insert patient
      await conn.query(
        'INSERT INTO Patient (UserID, DateOfBirth, Gender) VALUES (?, ?, ?)',
        [userId, dateOfBirth, gender]
      );
      
      await conn.commit();
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        userId: userId
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;