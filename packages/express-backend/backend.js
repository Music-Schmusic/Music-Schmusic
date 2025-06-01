import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authorize.js';
import dbrequests from './dbrequests.js';
import AccountFuncs from './Functionality/account.js';
import db from './db.js';
import playlistCoverRoutes from './routes/playlistCoverRoutes.js';
import spotifyStatsRoutes from './routes/spotifyStats.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import authenticateUser from './authMiddleware.js';
import mailer from './mailer.js';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import fs from 'fs';

console.log('backend.js starting up');
dotenv.config();

if (process.env.Runtime === 'test') {
  dotenv.config({ path: path.resolve('packages/express-backend/.env.test') });
} else {
  dotenv.config({ path: path.resolve('packages/express-backend/.env') });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

dbrequests.setDataBaseConn(db());

var allowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ashy-water-04166691e.6.azurestaticapps.net',
];

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-spotify-token, x-username'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('CORS blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-spotify-token',
      'x-username',
    ],
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/authorize', authRoutes);
app.use('/api/playlist-cover', playlistCoverRoutes);
app.use('/spotify/stats', spotifyStatsRoutes);

app.get('/', (req, res) => res.status(200).send('API Running'));

app.post('/signup', async (req, res) => {
  try {
    const accountToAdd = await AccountFuncs.createAccount(req.body);
    const newAccount = await dbrequests.addAccount(accountToAdd);
    res.status(201).send(newAccount);
  } catch (error) {
    console.log(error);
    if (error.message === 'Username already exists') {
      res.status(409).send('Username already in use');
    } else {
      res.status(400).send(error.message);
    }
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AccountFuncs.login(username, password);
    console.log('User object:', user);

    const secret =
      process.env.Runtime === 'test'
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

app.post('/accountrecovery', async (req, res) => {
  const id = crypto.randomBytes(32).toString('hex');
  res.cookie('CRSFtoken', id, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
  });

  try {
    const { username, email } = req.body;
    const user = await dbrequests.getAccount(username);
    if (!user) return res.status(404).send(`User ${username} does not exist`);
    if (user.email !== email)
      return res.status(401).send(`Email does not match`);

    const expiration = Date.now() + 5 * 60 * 1000;
    const token = crypto.randomBytes(32).toString('hex');
    const url = `${process.env.FRONTEND_URL}/resetvalidation?token=${token}`;

    await dbrequests.addRecoveryToken({
      token,
      expiration,
      CRSFtoken: id,
      user: username,
    });
    await mailer.sendEmail(
      email,
      `Click here to recover account: ${url}`,
      'Password Recovery'
    );

    res.status(200).send(`Email sent to ${email}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

app.post('/resetvalidation', async (req, res) => {
  const { token } = req.body;
  const CRSFtoken = req.cookies.CRSFtoken;
  const date = Date.now();

  try {
    const record = await dbrequests.getRecoveryToken(token);
    if (
      record &&
      token === record.token &&
      CRSFtoken === record.CRSFtoken &&
      date < record.expiration
    ) {
      res.status(200).json({ user: record.user });
    } else {
      res.status(401).send('Invalid Credentials');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

app.post('/resetpassword', async (req, res) => {
  const { p1, p2, user } = req.body;
  try {
    if (p1 === p2) {
      await AccountFuncs.resetPassword(user, p1);
      res.status(200).send('Password successfully updated');
    } else {
      res.status(400).send('Passwords do not match');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/protected', authenticateUser, (req, res) => {
  res.send(`Welcome ${req.user.username}`);
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Launch the server
try {
  if (process.env.Runtime !== 'test') {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment variables:', {
        Runtime: process.env.Runtime,
        PORT: process.env.PORT,
        JWT_SECRET: !!process.env.JWT_SECRET,
        TOKEN_SECRET: !!process.env.TOKEN_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL,
      });
    });
  }
} catch (err) {
  console.error('Failed to start server:', err);
}
process.on('exit', (code) => {
  console.log('Node process exiting with code:', code);
});

export default app;
