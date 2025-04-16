const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all medicines
router.get('/medicines', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Medicine ORDER BY Name'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get medicine by ID
router.get('/medicines/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Medicine WHERE MedicineID = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new medicine
// router.post('/medicines', async (req, res) => {
//   const { 
//     name, category, description, dosageForm, unitOfMeasure, 
//     genericName, manufacturer, isControlled 
//   } = req.body;
  
//   if (!name || !category || !dosageForm || !unitOfMeasure) {
//     return res.status(400).json({ success: false, message: 'Required fields are missing' });
//   }
  
//   try {
//     const [result] = await db.query(
//       'INSERT INTO Medicine (Name, Category, Description, DosageForm, UnitOfMeasure, GenericName, Manufacturer, IsControlled) ' +
//       'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//       [
//         name, category, description, dosageForm, unitOfMeasure, 
//         genericName, manufacturer, isControlled ? 1 : 0
//       ]
//     );
    
//     res.status(201).json({
//       success: true,
//       message: 'Medicine added successfully',
//       medicineId: result.insertId
//     });
//   } catch (error) {
//     console.error('Error adding medicine:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

router.post('/medicines', async (req, res) => {
  const { name, category, description, dosageForm, unitOfMeasure, genericName, manufacturer, isControlled } = req.body;
  
  if (!name || !category || !dosageForm || !unitOfMeasure) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  try {
    // Call the function to add the medicine
    const [result] = await db.query(
      'SELECT AddMedicineFunction(?, ?, ?, ?, ?, ?, ?, ?) AS medicineId',
      [name, category, description || null, dosageForm, unitOfMeasure, genericName || null, manufacturer || null, isControlled ? 1 : 0]
    );
    
    // Check if we got a valid medicine ID back
    const medicineId = result[0].medicineId;
    
    if (medicineId > 0) {
      res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        medicineId: medicineId
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add medicine' });
    }
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get inventory
router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT i.*, m.Name as MedicineName, m.DosageForm, m.UnitOfMeasure, m.Category, s.Name as SupplierName ' +
      'FROM Inventory i ' +
      'JOIN Medicine m ON i.MedicineID = m.MedicineID ' +
      'JOIN Supplier s ON i.SupplierID = s.SupplierID ' +
      'ORDER BY i.ExpiryDate'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to inventory
router.post('/inventory', async (req, res) => {
  const { 
    medicineId, batchNumber, supplierId, purchaseDate,
    expiryDate, quantityReceived, unitCost, sellingPrice, 
    storageLocation 
  } = req.body;
  
  if (!medicineId || !batchNumber || !supplierId || !purchaseDate || 
      !expiryDate || !quantityReceived || !unitCost || !sellingPrice) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO Inventory (MedicineID, BatchNumber, SupplierID, PurchaseDate, ' +
      'ExpiryDate, QuantityReceived, QuantityInStock, UnitCost, SellingPrice, StorageLocation) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        medicineId, batchNumber, supplierId, purchaseDate,
        expiryDate, quantityReceived, quantityReceived, unitCost, 
        sellingPrice, storageLocation
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Inventory added successfully',
      inventoryId: result.insertId
    });
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Supplier ORDER BY Name');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new supplier
router.post('/suppliers', async (req, res) => {
  const { name, contactPerson, email, phone, address, contractStartDate, contractEndDate } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO Supplier (Name, ContactPerson, Email, Phone, Address, ContractStartDate, ContractEndDate) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, contactPerson, email, phone, address, contractStartDate, contractEndDate]
    );
    
    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      supplierId: result.insertId
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, ' +
      'CONCAT(pu.FirstName, " ", pu.LastName) AS PatientName, ' +
      'CONCAT(du.FirstName, " ", du.LastName) AS DoctorName ' +
      'FROM Prescription p ' +
      'JOIN Patient pat ON p.PatientID = pat.PatientID ' +
      'JOIN User pu ON pat.UserID = pu.UserID ' +
      'JOIN Doctor d ON p.DoctorID = d.DoctorID ' +
      'JOIN User du ON d.UserID = du.UserID ' +
      'ORDER BY p.PrescriptionDate DESC'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get prescription details
router.get('/prescriptions/:id', async (req, res) => {
  try {
    // Get prescription header
    const [prescription] = await db.query(
      'SELECT p.*, ' +
      'CONCAT(pu.FirstName, " ", pu.LastName) AS PatientName, ' +
      'CONCAT(du.FirstName, " ", du.LastName) AS DoctorName ' +
      'FROM Prescription p ' +
      'JOIN Patient pat ON p.PatientID = pat.PatientID ' +
      'JOIN User pu ON pat.UserID = pu.UserID ' +
      'JOIN Doctor d ON p.DoctorID = d.DoctorID ' +
      'JOIN User du ON d.UserID = du.UserID ' +
      'WHERE p.PrescriptionID = ?',
      [req.params.id]
    );
    
    if (prescription.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    // Get prescription details
    const [details] = await db.query(
      'SELECT pd.*, m.Name as MedicineName, m.DosageForm, m.UnitOfMeasure ' +
      'FROM PrescriptionDetail pd ' +
      'JOIN Medicine m ON pd.MedicineID = m.MedicineID ' +
      'WHERE pd.PrescriptionID = ?',
      [req.params.id]
    );
    
    const result = {
      ...prescription[0],
      details: details
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching prescription details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new prescription
router.post('/prescriptions', async (req, res) => {
  const { patientId, doctorId, consultationId, prescriptionDate, notes, details } = req.body;
  
  if (!patientId || !doctorId || !consultationId || !prescriptionDate || !details || details.length === 0) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }
  
  const conn = await db.getConnection();
  await conn.beginTransaction();
  
  try {
    // Insert prescription header
    const [result] = await conn.query(
      'INSERT INTO Prescription (PatientID, DoctorID, ConsultationID, PrescriptionDate, Notes) ' +
      'VALUES (?, ?, ?, ?, ?)',
      [patientId, doctorId, consultationId, prescriptionDate, notes]
    );
    
    const prescriptionId = result.insertId;
    
    // Insert prescription details
    for (const detail of details) {
      await conn.query(
        'INSERT INTO PrescriptionDetail (PrescriptionID, MedicineID, Dosage, Frequency, Duration, Instructions) ' +
        'VALUES (?, ?, ?, ?, ?, ?)',
        [
          prescriptionId, detail.medicineId, detail.dosage, detail.frequency, 
          detail.duration, detail.instructions
        ]
      );
    }
    
    await conn.commit();
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescriptionId: prescriptionId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating prescription:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;