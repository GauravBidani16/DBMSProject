const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const pharmacyRoutes = require('./routes/pharmacy');
const bedRoutes = require('./routes/beds');
const vitalsRoutes = require('./routes/vitals');
const billingRoutes = require('./routes/billing');

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/billing', billingRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the IHMS API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});