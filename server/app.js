import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import testRoutes from './routes/test.js';



const app = express();
app.use((req, res, next) => {
  console.log(`🌐 Incoming request: ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/test', testRoutes);

console.log('userRoutes:', userRoutes);
app.use('/api/users', userRoutes);
// app._router.stack.forEach((r) => {
//   if (r.route && r.route.path) {
//     console.log('Registered route:', r.route.path);
//   }
// });

app.use((req, res, next) => {
  console.log(`Reached catch-all middleware: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;