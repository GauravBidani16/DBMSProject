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

// Add new vitals log
router.post('/', async (req, res) => {
  const { patientId, recordedBy, notes, heartRate, bloodPressure, temperature, oxygenSaturation } = req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: 'Patient ID is required' });
  }

  if (!heartRate && !bloodPressure && !temperature && !oxygenSaturation) {
    return res.status(400).json({ success: false, message: 'At least one vital sign must be provided' });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Insert into VitalsLog table
    const logQuery = `
      INSERT INTO VitalsLog (PatientID, RecordedBy, Notes) 
      VALUES (?, ?, ?)
    `;
    const logResult = await conn.query(logQuery, [patientId, recordedBy, notes]);
    const logId = logResult[0].insertId;

    // Insert individual vital signs
    if (heartRate) {
      await conn.query('INSERT INTO HeartRateLog (LogID, HeartRate) VALUES (?, ?)', [logId, heartRate]);
    }

    if (bloodPressure && bloodPressure.systolic && bloodPressure.diastolic) {
      await conn.query(
        'INSERT INTO BloodPressureLog (LogID, Systolic, Diastolic) VALUES (?, ?, ?)', 
        [logId, bloodPressure.systolic, bloodPressure.diastolic]
      );
    }

    if (temperature) {
      await conn.query('INSERT INTO TemperatureLog (LogID, Temperature) VALUES (?, ?)', [logId, temperature]);
    }

    if (oxygenSaturation) {
      await conn.query('INSERT INTO OxygenSaturationLog (LogID, SpO2) VALUES (?, ?)', [logId, oxygenSaturation]);
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Vitals recorded successfully',
      logId: logId
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

// Get latest vitals for a patient
router.get('/patient/:id/latest', async (req, res) => {
  try {
    const query = 'CALL getPatientLatestVitalsProcedure(?)';
    const results = await executeQuery(query, [req.params.id]);

    const vitals = results[0][0];

    if (!vitals || !vitals.LogID) {
      return res.json({ success: true, data: null });
    }

    const formattedData = {
      LogID: vitals.LogID,
      RecordedAt: vitals.RecordedAt,
      Notes: vitals.Notes,
      heartRate: vitals.HeartRate,
      bloodPressure: (vitals.Systolic && vitals.Diastolic)
        ? { systolic: vitals.Systolic, diastolic: vitals.Diastolic }
        : null,
      temperature: vitals.Temperature,
      oxygenSaturation: vitals.SpO2
    };

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient vitals history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const query = 'CALL getPatientVitalHistory(?)';
    const results = await executeQuery(query, [req.params.patientId]);

    const vitals = results[0].map(record => ({
      ...record,
      bloodPressure: (record.Systolic && record.Diastolic)
        ? { systolic: record.Systolic, diastolic: record.Diastolic }
        : null,
      recordedAt: record.RecordedAt,
      notes: record.Notes,
      heartRate: record.HeartRate,
      temperature: record.Temperature,
      oxygenSaturation: record.SpO2
    }));

    res.json({ success: true, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;