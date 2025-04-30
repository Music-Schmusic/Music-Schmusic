import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import spotifyRoutes from './routes/spotify.js';
import authRoutes from './routes/auth.js';
import routes from '../backend.js';
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);


app.use(express.json());

// Routes
app.use('/spotify', spotifyRoutes);
app.use('/', authRoutes);
app.use('/', routes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded:', {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not set',
  });
});
