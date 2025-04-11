const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT UserID, Email, FirstName, LastName, Role, PhoneNumber, IsActive FROM User'
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT UserID, Email, FirstName, LastName, Role, PhoneNumber, IsActive FROM User WHERE UserID = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { firstName, lastName, phoneNumber, isActive } = req.body;
  const userId = req.params.id;
  
  try {
    const [result] = await db.query(
      'UPDATE User SET FirstName = ?, LastName = ?, PhoneNumber = ?, IsActive = ? WHERE UserID = ?',
      [firstName, lastName, phoneNumber, isActive ? 1 : 0, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;