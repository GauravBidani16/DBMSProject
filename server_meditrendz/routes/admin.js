const express = require('express');
const router = express.Router();
const db = require('../config/db');

const getCount = async (table) => {
  const [result] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
  return result[0].count;
};

const getMonthlyStats = async () => {
  const [monthlyStats] = await db.query(`
    SELECT 
      DATE_FORMAT(a.AppointmentDate, '%Y-%m') as month_year,
      DATE_FORMAT(a.AppointmentDate, '%M %Y') as month,
      COUNT(DISTINCT a.AppointmentID) as appointments,
      COUNT(DISTINCT pa.AdmissionID) as admissions,
      COUNT(DISTINCT CASE WHEN pa.Status = 'Discharged' THEN pa.AdmissionID END) as discharged,
      SUM(IFNULL(b.TotalAmount, 0)) as revenue
    FROM 
      (SELECT DISTINCT DATE_FORMAT(AppointmentDate, '%Y-%m-01') as date 
       FROM Appointment 
       WHERE AppointmentDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      ) as dates
    LEFT JOIN Appointment a ON DATE_FORMAT(a.AppointmentDate, '%Y-%m') = DATE_FORMAT(dates.date, '%Y-%m')
    LEFT JOIN PatientAdmission pa ON DATE_FORMAT(pa.AdmissionDate, '%Y-%m') = DATE_FORMAT(dates.date, '%Y-%m')
    LEFT JOIN Bill b ON DATE_FORMAT(b.BillDate, '%Y-%m') = DATE_FORMAT(dates.date, '%Y-%m')
    GROUP BY month_year, month
    ORDER BY month_year DESC
    LIMIT 6
  `);

  return monthlyStats.map(stat => ({
    month: stat.month,
    appointments: stat.appointments || 0,
    admissions: stat.admissions || 0,
    discharged: stat.discharged || 0,
    revenue: parseFloat(stat.revenue || 0)
  }));
};

router.get('/dashboard', async (req, res) => {
  try {
    const [todayAppointments] = await db.query(
      `SELECT COUNT(*) as count FROM Appointment WHERE DATE(AppointmentDate) = CURDATE()`
    );

    const [availableBeds] = await db.query(
      `SELECT COUNT(*) as count FROM Bed WHERE Status = "Available"`
    );

    const monthlyStats = await getMonthlyStats();

    res.json({
      success: true,
      data: {
        totalPatients: await getCount('Patient'),
        totalDoctors: await getCount('Doctor'),
        todayAppointments: todayAppointments[0].count,
        availableBeds: availableBeds[0].count,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;