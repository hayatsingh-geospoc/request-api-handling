"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const UserService_1 = require("./services/UserService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service';
const API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT) || 5;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 300;
// Initialize services
const userService = new UserService_1.UserService();
// Connect to MongoDB
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Routes
app.post('/api/users/fetch', async (req, res) => {
    try {
        await userService.fetchUsers();
        res.json({ message: 'User fetch process started' });
    }
    catch (error) {
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
            sortBy: sortBy,
            search,
        });
        res.json(result);
    }
    catch (error) {
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
