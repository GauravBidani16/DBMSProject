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

// Get all medicines
router.get('/medicines', async (req, res) => {
  try {
    const medicines = await executeQuery('SELECT * FROM Medicine ORDER BY Name');
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new medicine
router.post('/medicines', async (req, res) => {
  const { name, category, description, dosageForm, unitOfMeasure, genericName, manufacturer, isControlled } = req.body;

  if (!name || !category || !dosageForm || !unitOfMeasure) {
    return res.status(400).json({ success: false, message: 'Required fields are missing' });
  }

  try {
    const query = `
      SELECT AddMedicineFunction(?, ?, ?, ?, ?, ?, ?, ?) AS medicineId
    `;
    const result = await executeQuery(query, [
      name, category, description || null, dosageForm, unitOfMeasure,
      genericName || null, manufacturer || null, isControlled ? 1 : 0
    ]);

    const medicineId = result[0].medicineId;

    if (medicineId > 0) {
      res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        medicineId
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add medicine' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get inventory details
router.get('/inventory', async (req, res) => {
  try {
    const query = `
      SELECT i.*, m.Name AS MedicineName, m.DosageForm, m.UnitOfMeasure, m.Category, s.Name AS SupplierName
      FROM Inventory i
      JOIN Medicine m ON i.MedicineID = m.MedicineID
      JOIN Supplier s ON i.SupplierID = s.SupplierID
      ORDER BY i.ExpiryDate
    `;
    const inventory = await executeQuery(query);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const query = `
      INSERT INTO Inventory (MedicineID, BatchNumber, SupplierID, PurchaseDate,
                             ExpiryDate, QuantityReceived, QuantityInStock, UnitCost,
                             SellingPrice, StorageLocation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      medicineId, batchNumber, supplierId, purchaseDate,
      expiryDate, quantityReceived, quantityReceived, unitCost,
      sellingPrice, storageLocation
    ]);

    res.status(201).json({
      success: true,
      message: 'Inventory added successfully',
      inventoryId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await executeQuery('SELECT * FROM Supplier ORDER BY Name');
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;