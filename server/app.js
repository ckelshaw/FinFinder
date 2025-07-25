import express from 'express';
import cors from 'cors';
//import morgan from 'morgan';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(ClerkExpressWithAuth());
//app.use(morgan('dev')); // Log HTTP requests

// Routes
import tripRoutes from './routes/trips/tripRoutes.js';
import userRoutes from './routes/users/userRoutes.js';
import riverRoutes from './routes/rivers/riverRoutes.js';
import weatherRoutes from './routes/weather/weatherRoutes.js';
import spotRoutes from './routes/spots/spotRoutes.js'

// Route mounting
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rivers', riverRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/spots', spotRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Fin Finder API is live');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;