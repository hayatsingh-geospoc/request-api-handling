import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import { UserService } from './services/UserService';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service';
const API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT) || 5;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 300;

// Initialize services
const userService = new UserService();

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/users/fetch', async (req, res) => {
  try {
    await userService.fetchUsers();
    res.json({ message: 'User fetch process started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start user fetch process' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { page, limit, sortBy } = req.query;
    const search = req.body.search || {};

    const result = await userService.getUsers({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      search,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
