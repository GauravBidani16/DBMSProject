// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// // Get all services
// router.get('/services', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM Service ORDER BY Name');
//     res.json({ success: true, data: rows });
//   } catch (error) {
//     console.error('Error fetching services:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Create a new service
// router.post('/services', async (req, res) => {
//   const { name, category, description, defaultCost, taxRate } = req.body;
  
//   if (!name || !category || !defaultCost) {
//     return res.status(400).json({ success: false, message: 'Required fields are missing' });
//   }
  
//   try {
//     const [result] = await db.query(
//       'INSERT INTO Service (Category, Name, Description, DefaultCost, TaxRate) VALUES (?, ?, ?, ?, ?)',
//       [category, name, description, defaultCost, taxRate || 0]
//     );
    
//     res.status(201).json({
//       success: true,
//       message: 'Service added successfully',
//       serviceId: result.insertId
//     });
//   } catch (error) {
//     console.error('Error adding service:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get all bills
// router.get('/bills', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT b.*, CONCAT(u.FirstName, " ", u.LastName) as PatientName ' +
//       'FROM Bill b ' +
//       'JOIN Patient p ON b.PatientID = p.PatientID ' +
//       'JOIN User u ON p.UserID = u.UserID ' +
//       'ORDER BY b.BillDate DESC'
//     );
    
//     res.json({ success: true, data: rows });
//   } catch (error) {
//     console.error('Error fetching bills:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get bill by ID
// router.get('/bills/:id', async (req, res) => {
//   try {
//     // Get bill header
//     const [bills] = await db.query(
//       'SELECT b.*, CONCAT(u.FirstName, " ", u.LastName) as PatientName ' +
//       'FROM Bill b ' +
//       'JOIN Patient p ON b.PatientID = p.PatientID ' +
//       'JOIN User u ON p.UserID = u.UserID ' +
//       'WHERE b.BillID = ?',
//       [req.params.id]
//     );
    
//     if (bills.length === 0) {
//       return res.status(404).json({ success: false, message: 'Bill not found' });
//     }
    
//     // Get bill details
//     const [details] = await db.query(
//       'SELECT bd.*, s.Name as ServiceName ' +
//       'FROM BillDetail bd ' +
//       'LEFT JOIN Service s ON bd.ServiceID = s.ServiceID ' +
//       'WHERE bd.BillID = ?',
//       [req.params.id]
//     );
    
//     // Get payments for this bill
//     const [payments] = await db.query(
//       'SELECT p.*, pm.Name as PaymentMethodName ' +
//       'FROM Payment p ' +
//       'JOIN PaymentMethod pm ON p.MethodID = pm.MethodID ' +
//       'WHERE p.BillID = ? ' +
//       'ORDER BY p.PaymentDate',
//       [req.params.id]
//     );
    
//     const result = {
//       ...bills[0],
//       details: details,
//       payments: payments
//     };
    
//     res.json({ success: true, data: result });
//   } catch (error) {
//     console.error('Error fetching bill:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Create a new bill
// router.post('/bills', async (req, res) => {
//   const { 
//     patientId, 
//     admissionId, 
//     dueDate, 
//     notes,
//     createdBy,
//     items 
//   } = req.body;
  
//   if (!patientId || !dueDate || !createdBy || !items || items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Required fields are missing' });
//   }
  
//   const conn = await db.getConnection();
//   await conn.beginTransaction();
  
//   try {
//     // Calculate totals
//     let subTotal = 0;
//     let taxAmount = 0;
//     let discountAmount = 0;
    
//     for (const item of items) {
//       const itemSubtotal = item.unitPrice * item.quantity;
//       const itemTaxAmount = itemSubtotal * (item.taxRate / 100);
      
//       subTotal += itemSubtotal;
//       taxAmount += itemTaxAmount;
//       discountAmount += (item.discountAmount || 0);
//     }
    
//     const totalAmount = subTotal + taxAmount - discountAmount;
    
//     // Create bill header
//     const [billResult] = await conn.query(
//       'INSERT INTO Bill (PatientID, AdmissionID, BillDate, DueDate, SubTotal, TaxAmount, ' +
//       'DiscountAmount, TotalAmount, Status, Notes, CreatedBy) ' +
//       'VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)',
//       [
//         patientId, 
//         admissionId, 
//         dueDate, 
//         subTotal, 
//         taxAmount, 
//         discountAmount, 
//         totalAmount, 
//         'Draft', 
//         notes, 
//         createdBy
//       ]
//     );
    
//     const billId = billResult.insertId;
    
//     // Add bill details
//     for (const item of items) {
//       const itemTotal = (item.unitPrice * item.quantity) + 
//                         ((item.unitPrice * item.quantity) * (item.taxRate / 100)) - 
//                         (item.discountAmount || 0);
      
//       await conn.query(
//         'INSERT INTO BillDetail (BillID, ServiceID, Description, Quantity, UnitPrice, ' +
//         'TaxRate, TaxAmount, DiscountAmount, TotalAmount, PrescriptionDetailID) ' +
//         'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//         [
//           billId,
//           item.serviceId,
//           item.description,
//           item.quantity,
//           item.unitPrice,
//           item.taxRate || 0,
//           (item.unitPrice * item.quantity) * (item.taxRate / 100),
//           item.discountAmount || 0,
//           itemTotal,
//           item.prescriptionDetailId
//         ]
//       );
//     }
    
//     await conn.commit();
    
//     res.status(201).json({
//       success: true,
//       message: 'Bill created successfully',
//       billId: billId
//     });
//   } catch (error) {
//     await conn.rollback();
//     console.error('Error creating bill:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   } finally {
//     conn.release();
//   }
// });

// // Update bill status
// router.patch('/bills/:id/status', async (req, res) => {
//   const { status } = req.body;
  
//   if (!status) {
//     return res.status(400).json({ success: false, message: 'Status is required' });
//   }
  
//   try {
//     const [result] = await db.query(
//       'UPDATE Bill SET Status = ?, UpdatedAt = NOW() WHERE BillID = ?',
//       [status, req.params.id]
//     );
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Bill not found' });
//     }
    
//     res.json({ success: true, message: 'Bill status updated successfully' });
//   } catch (error) {
//     console.error('Error updating bill status:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get all payment methods
// router.get('/payment-methods', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM PaymentMethod');
//     res.json({ success: true, data: rows });
//   } catch (error) {
//     console.error('Error fetching payment methods:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Record a payment
// router.post('/payments', async (req, res) => {
//   const { billId, amount, methodId, transactionReference, notes, receivedBy } = req.body;
  
//   if (!billId || !amount || !methodId || !receivedBy) {
//     return res.status(400).json({ success: false, message: 'Required fields are missing' });
//   }
  
//   const conn = await db.getConnection();
//   await conn.beginTransaction();
  
//   try {
//     // Get the bill
//     const [bills] = await conn.query('SELECT * FROM Bill WHERE BillID = ?', [billId]);
    
//     if (bills.length === 0) {
//       await conn.rollback();
//       return res.status(404).json({ success: false, message: 'Bill not found' });
//     }
    
//     const bill = bills[0];
    
//     // Get total payments so far
//     const [paymentSums] = await conn.query(
//       'SELECT SUM(Amount) as TotalPaid FROM Payment WHERE BillID = ?',
//       [billId]
//     );
    
//     const totalPaid = paymentSums[0].TotalPaid || 0;
//     const newTotalPaid = totalPaid + parseFloat(amount);
//     let newStatus = bill.Status;
    
//     // Update bill status based on payment amount
//     if (newTotalPaid >= bill.TotalAmount) {
//       newStatus = 'Paid';
//     } else if (newTotalPaid > 0) {
//       newStatus = 'Partially Paid';
//     }
    
//     // Record the payment
//     const [paymentResult] = await conn.query(
//       'INSERT INTO Payment (BillID, PaymentDate, Amount, MethodID, TransactionReference, Notes, ReceivedBy) ' +
//       'VALUES (?, NOW(), ?, ?, ?, ?, ?)',
//       [billId, amount, methodId, transactionReference, notes, receivedBy]
//     );
    
//     // Update bill status
//     await conn.query(
//       'UPDATE Bill SET Status = ?, UpdatedAt = NOW() WHERE BillID = ?',
//       [newStatus, billId]
//     );
    
//     await conn.commit();
    
//     res.status(201).json({
//       success: true,
//       message: 'Payment recorded successfully',
//       paymentId: paymentResult.insertId,
//       billStatus: newStatus
//     });
//   } catch (error) {
//     await conn.rollback();
//     console.error('Error recording payment:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   } finally {
//     conn.release();
//   }
// });

// module.exports = router;