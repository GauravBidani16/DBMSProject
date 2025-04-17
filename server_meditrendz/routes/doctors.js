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

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT d.DoctorID, u.FirstName, u.LastName, d.Specialization, d.LicenseNumber,
             dep.Name AS Department, d.ConsultationFee, u.Email, u.PhoneNumber, u.IsActive
      FROM Doctor d
      JOIN User u ON d.UserID = u.UserID
      JOIN Department dep ON d.DepartmentID = dep.DepartmentID
    `;
    const doctors = await executeQuery(query);
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all departments
router.get('/department', async (req, res) => {
  try {
    const departments = await executeQuery('SELECT * FROM Department ORDER BY Name');
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctorQuery = `
      SELECT d.DoctorID, u.FirstName, u.LastName, d.Specialization, d.LicenseNumber,
             dep.Name AS Department, d.ConsultationFee, u.Email, u.PhoneNumber, u.IsActive,
             d.Qualification
      FROM Doctor d
      JOIN User u ON d.UserID = u.UserID
      JOIN Department dep ON d.DepartmentID = dep.DepartmentID
      WHERE d.DoctorID = ?
    `;
    const doctorRows = await executeQuery(doctorQuery, [req.params.id]);

    if (!doctorRows.length) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const scheduleQuery = `SELECT * FROM DoctorSchedule WHERE DoctorID = ?`;
    const schedules = await executeQuery(scheduleQuery, [req.params.id]);

    const doctor = doctorRows[0];
    doctor.schedules = schedules;

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patients by doctor ID
router.get('/:id/patients', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT p.PatientID, u.FirstName, u.LastName, p.Gender, p.DateOfBirth,
             TIMESTAMPDIFF(YEAR, p.DateOfBirth, CURDATE()) AS Age,
             MAX(a.AppointmentDate) AS LastVisit
      FROM Patient p
      JOIN User u ON p.UserID = u.UserID
      JOIN Appointment a ON p.PatientID = a.PatientID
      WHERE a.DoctorID = ?
      GROUP BY p.PatientID
      ORDER BY LastVisit DESC
    `;
    const patients = await executeQuery(query, [req.params.id]);
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register a new doctor
router.post('/', async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, specialization,
          licenseNumber, departmentId, consultationFee, qualification } = req.body;

  if (!email || !password || !firstName || !lastName || !specialization ||
      !licenseNumber || !departmentId || !consultationFee) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  try {
    const existingUserQuery = 'SELECT * FROM User WHERE Email = ?';
    const existingUsers = await executeQuery(existingUserQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const functionQuery = `
      SELECT registerDoctorFunction(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS doctorId
    `;
    const result = await executeQuery(functionQuery, [
      email, password, firstName, lastName, phoneNumber || null,
      specialization, licenseNumber, departmentId, consultationFee,
      qualification || null
    ]);

    const doctorId = result[0].doctorId;

    if (doctorId > 0) {
      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully',
        doctorId
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to register doctor' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;