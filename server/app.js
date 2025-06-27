import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import testRoutes from './routes/test.js';
import tripRoutes from './routes/trips.js';
import tripCompletedRoutes from './routes/tripCompleted.js';
import updateTripNotes from './routes/updateTripNotes.js';
import searchRivers from './routes/searchRivers.js';
import searchUSGS from './routes/searchUSGS.js';
import updateTrip from './routes/updateTrip.js';

const app = express();
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/test', testRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trip', tripCompletedRoutes);
app.use('/api/trip/', updateTripNotes);
app.use('/api/search-rivers', searchRivers);
app.use('/api/search-usgs', searchUSGS);
app.use('/api/trip', updateTrip);

app.use((req, res, next) => {
  console.log(`Reached catch-all middleware: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;