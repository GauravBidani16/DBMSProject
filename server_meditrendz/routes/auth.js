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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const query = `
      SELECT User.*, Doctor.DoctorID, Patient.PatientID, Admin.AdminID
      FROM User
      LEFT JOIN Doctor ON User.UserID = Doctor.UserID
      LEFT JOIN Patient ON User.UserID = Patient.UserID
      LEFT JOIN Admin ON User.UserID = Admin.UserID
      WHERE Email = ? AND Password = ?
    `;
    const rows = await executeQuery(query, [email, password]);

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
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
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, dateOfBirth, gender, phoneNumber } = req.body;

  if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  try {
    const checkQuery = 'SELECT * FROM User WHERE Email = ?';
    const existingUsers = await executeQuery(checkQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const userQuery = `
        INSERT INTO User (Email, Password, FirstName, LastName, PhoneNumber, Role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [userResult] = await conn.query(userQuery, [
        email, password, firstName, lastName, phoneNumber, 'Patient'
      ]);

      const userId = userResult.insertId;

      const patientQuery = `
        INSERT INTO Patient (UserID, DateOfBirth, Gender)
        VALUES (?, ?, ?)
      `;
      await conn.query(patientQuery, [userId, dateOfBirth, gender]);

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
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;