// Load environment variables as early as possible so other modules (like Prisma adapter) can read them
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
import roleRoutes from './routes/role.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', roleRoutes);
// Mount task routes at /api/tasks so frontend can use /api/tasks
app.use('/api/tasks', taskRoutes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


export default app;
