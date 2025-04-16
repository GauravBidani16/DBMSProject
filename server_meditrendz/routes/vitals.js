const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get patient vitals logs
// router.get('/patient/:patientId', async (req, res) => {
//   try {
//     // Get vitals logs
//     const [logs] = await db.query(
//       'SELECT * FROM VitalsLog WHERE PatientID = ? ORDER BY RecordedAt DESC',
//       [req.params.patientId]
//     );
    
//     // Get detailed measurements for each log
//     const results = [];
//     for (const log of logs) {
//       // Get heart rate
//       const [heartRate] = await db.query(
//         'SELECT * FROM HeartRateLog WHERE LogID = ?',
//         [log.LogID]
//       );
      
//       // Get blood pressure
//       const [bloodPressure] = await db.query(
//         'SELECT * FROM BloodPressureLog WHERE LogID = ?',
//         [log.LogID]
//       );
      
//       // Get temperature
//       const [temperature] = await db.query(
//         'SELECT * FROM TemperatureLog WHERE LogID = ?',
//         [log.LogID]
//       );
      
//       // Get oxygen saturation
//       const [oxygenSaturation] = await db.query(
//         'SELECT * FROM OxygenSaturationLog WHERE LogID = ?',
//         [log.LogID]
//       );
      
//       results.push({
//         ...log,
//         heartRate: heartRate.length > 0 ? heartRate[0].HeartRate : null,
//         bloodPressure: bloodPressure.length > 0 ? {
//           systolic: bloodPressure[0].Systolic,
//           diastolic: bloodPressure[0].Diastolic
//         } : null,
//         temperature: temperature.length > 0 ? temperature[0].Temperature : null,
//         oxygenSaturation: oxygenSaturation.length > 0 ? oxygenSaturation[0].SpO2 : null,
//         randomTest: ""
//       });
//     }
    
//     res.json({ success: true, data: results });
//   } catch (error) {
//     console.error('Error fetching vitals:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// Add new vitals log
router.post('/', async (req, res) => {
  const { 
    patientId, 
    recordedBy, 
    notes,
    heartRate,
    bloodPressure,
    temperature,
    oxygenSaturation
  } = req.body;
  
  if (!patientId) {
    return res.status(400).json({ success: false, message: 'Patient ID is required' });
  }
  
  // At least one vital sign must be provided
  if (!heartRate && !bloodPressure && !temperature && !oxygenSaturation) {
    return res.status(400).json({ success: false, message: 'At least one vital sign must be provided' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Create main vitals log
    const [logResult] = await conn.query(
      'INSERT INTO VitalsLog (PatientID, RecordedBy, Notes) VALUES (?, ?, ?)',
      [patientId, recordedBy, notes]
    );
    
    const logId = logResult.insertId;
    
    // Add heart rate if provided
    if (heartRate) {
      await conn.query(
        'INSERT INTO HeartRateLog (LogID, HeartRate) VALUES (?, ?)',
        [logId, heartRate]
      );
    }
    
    // Add blood pressure if provided
    if (bloodPressure && bloodPressure.systolic && bloodPressure.diastolic) {
      await conn.query(
        'INSERT INTO BloodPressureLog (LogID, Systolic, Diastolic) VALUES (?, ?, ?)',
        [logId, bloodPressure.systolic, bloodPressure.diastolic]
      );
    }
    
    // Add temperature if provided
    if (temperature) {
      await conn.query(
        'INSERT INTO TemperatureLog (LogID, Temperature) VALUES (?, ?)',
        [logId, temperature]
      );
    }
    
    // Add oxygen saturation if provided
    if (oxygenSaturation) {
      await conn.query(
        'INSERT INTO OxygenSaturationLog (LogID, SpO2) VALUES (?, ?)',
        [logId, oxygenSaturation]
      );
    }
    
    await conn.commit();
    
    res.status(201).json({
      success: true,
      message: 'Vitals recorded successfully',
      logId: logId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error recording vitals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// Get vitals log by ID
router.get('/:id', async (req, res) => {
  try {
    // Get main log
    const [logs] = await db.query(
      'SELECT * FROM VitalsLog WHERE LogID = ?',
      [req.params.id]
    );
    
    if (logs.length === 0) {
      return res.status(404).json({ success: false, message: 'Vitals log not found' });
    }
    
    const log = logs[0];
    
    // Get heart rate
    const [heartRate] = await db.query(
      'SELECT * FROM HeartRateLog WHERE LogID = ?',
      [log.LogID]
    );
    
    // Get blood pressure
    const [bloodPressure] = await db.query(
      'SELECT * FROM BloodPressureLog WHERE LogID = ?',
      [log.LogID]
    );
    
    // Get temperature
    const [temperature] = await db.query(
      'SELECT * FROM TemperatureLog WHERE LogID = ?',
      [log.LogID]
    );
    
    // Get oxygen saturation
    const [oxygenSaturation] = await db.query(
      'SELECT * FROM OxygenSaturationLog WHERE LogID = ?',
      [log.LogID]
    );
    
    const result = {
      ...log,
      heartRate: heartRate.length > 0 ? heartRate[0] : null,
      bloodPressure: bloodPressure.length > 0 ? bloodPressure[0] : null,
      temperature: temperature.length > 0 ? temperature[0] : null,
      oxygenSaturation: oxygenSaturation.length > 0 ? oxygenSaturation[0] : null
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching vitals log:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/patient/:id/latest', async (req, res) => {
  try {
    const [results] = await db.query(
      'CALL getPatientLatestVitalsProcedure(?)',
      [req.params.id]
    );
    
    // The result is in the first element of the first row
    const vitals = results[0][0];
    
    if (!vitals || !vitals.LogID) {
      return res.json({ success: true, data: null });
    }
    
    // Format the response to match the structure used by the frontend
    const formattedData = {
      LogID: vitals.LogID,
      RecordedAt: vitals.RecordedAt,
      Notes: vitals.Notes,
      heartRate: vitals.HeartRate,
      bloodPressure: (vitals.Systolic && vitals.Diastolic) ? {
        systolic: vitals.Systolic,
        diastolic: vitals.Diastolic
      } : null,
      temperature: vitals.Temperature,
      oxygenSaturation: vitals.SpO2
    };
    
    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(`Error fetching latest vitals for patient ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [results] = await db.query(
      'CALL getPatientVitalHistory(?)',
      [req.params.patientId]
    );
    
    const vitals = results[0].map(record => ({
      ...record,
      bloodPressure: (record.Systolic && record.Diastolic) ? {
        systolic: record.Systolic,
        diastolic: record.Diastolic
      } : null,
      recordedAt: record.RecordedAt,
      Notes: record.Notes,
      heartRate: record.HeartRate,
      temperature: record.Temperature,
      oxygenSaturation: record.SpO2
    }));
    
    res.json({ success: true, data: vitals });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;