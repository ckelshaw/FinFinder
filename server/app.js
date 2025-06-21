import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';



const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

console.log('userRoutes =', userRoutes);
app.use('/api/users', userRoutes);
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log('Registered route:', r.route.path);
  }
});

export default app;