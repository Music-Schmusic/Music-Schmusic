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


dotenv.config();

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

// Routes
app.use('/authorize', authRoutes);
app.use('/', routes);
app.use('/api/playlist-cover', playlistCoverRoutes);
app.use('/spotify/stats', spotifyStatsRoutes);

dbrequests.setDataBaseConn(db());

app.get('/', (req, res) => res.send('API Running'));
app.use(cookieParser());
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

app.post('/accountrecovery', async (req, res) => {
  console.log(req);
  const id = crypto.randomBytes(32).toString('hex');
  res.cookie('CRSFtoken', id, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
  });

  console.log(id);

  try {
    const { username, email } = req.body;
    const user = await dbrequests.getAccount(username);
    if (user === null) {
      res.status(404).send(`User ${username} does not exist`);
    } else if (user.email != email) {
      res
        .status(401)
        .send(`Email does not match the email for user: ${username}`);
    } else {
      //exprdate = now + 5m
      const expiration_date = Date.now() + 300000;
      const token = crypto.randomBytes(32).toString('hex');
      const url = `http://localhost:5173/resetvalidation?token=${token}`;
      const recoveryToken = {
        token: token,
        expiration: expiration_date,
        CRSFtoken: id,
        user: username,
      };
      await dbrequests.addRecoveryToken(recoveryToken);
      await mailer.sendEmail(
        email,
        `Click here to recover account: ${url}`,
        'Testing Get'
      );
      res.status(200).send(`Account recovery email has been sent to ${email}`);
    }
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
    console.log(record);
    if (record === undefined) {
      console.log('Could not find request');
    } else if (
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
  console.log(user);
  console.log('\n');
  console.log(p1);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables loaded:', {
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not set',
    });
  });
}

export default app;
