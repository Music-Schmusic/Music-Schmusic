import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authorize.js';
import dbrequests from './dbrequests.js';
import AccountFuncs from './Functionality/account.js';
import db from './db.js';
import playlistCoverRoutes from './routes/playlistCoverRoutes.js';
import spotifyStatsRoutes from './routes/spotifyStats.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import authenticateUser from './authMiddleware.js';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve('packages/express-backend/.env.test') });
} else {
  dotenv.config({ path: path.resolve('packages/express-backend/.env') });
}

const app = express();
const PORT = process.env.PORT || 8000;

dbrequests.setDataBaseConn(db());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use('/authorize', authRoutes);
app.get('/', (req, res) => res.send('API Running'));

app.post('/signup', async (req, res) => {
  try {
    const accountToAdd = await AccountFuncs.createAccount(req.body);
    const newAccount = await dbrequests.addAccount(accountToAdd);
    res.status(201).send(newAccount);
  } catch (error) {
    console.log(error);
    console.log('bad');
    res.status(409).send('Username Already Exists');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AccountFuncs.login(username, password);
    console.log('User object:', user);
    // Choose the correct secret
    const secret =
      process.env.NODE_ENV === 'test'
        ? process.env.JWT_SECRET
        : process.env.TOKEN_SECRET;
    const token = jwt.sign({ username: user.username }, secret, {
      expiresIn: '15m',
    });
    res.status(200).json({ token, username: user.username, email: user.email });
  } catch (error) {
    console.log('Login Error:', error.message);
    res.status(401).send(error.message);
  }
});

app.get('/protected', authenticateUser, (req, res) => {
  res.send(`Welcome ${req.user.username}`);
});

app.use('/api/playlist-cover', playlistCoverRoutes);
app.use('/spotify', spotifyStatsRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
