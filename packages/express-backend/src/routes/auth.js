// import express from 'express';
// import jwt from 'jsonwebtoken';

// const router = express.Router();

// // Get JWT secret from environment or use a fallback for development
// const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Token invalid or expired' });
//   }
// };

// // Login route
// router.post('/login', (req, res) => {
//   console.log('Login attempt with:', req.body);

//   const { username, password } = req.body;

//   // For testing purposes, accept any non-empty username and password
//   if (username && password) {
//     try {
//       const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
//       console.log('Login successful for:', username);
//       res.json({
//         token,
//         username,
//         message: 'Login successful',
//       });
//     } catch (err) {
//       console.error('JWT signing error:', err);
//       res.status(500).json({
//         message: 'Error creating authentication token',
//         error: err.message,
//       });
//     }
//   } else {
//     console.log('Login failed - missing credentials');
//     res.status(401).json({
//       message: 'Invalid credentials',
//       received: { username, password },
//     });
//   }
// });

// // Signup route
// router.post('/signup', (req, res) => {
//   const { username, password } = req.body;

//   // In a real app, you would create a new user in the database
//   // For demo purposes, we'll just return success
//   res.status(201).json({ message: 'User created successfully' });
// });

// // Authorize route for Spotify OAuth
// router.get('/authorize', (req, res) => {
//   const clientId = process.env.SPOTIFY_CLIENT_ID;
//   const redirectUri =
//     process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/oauth-success';
//   const scope =
//     'user-read-private user-read-email user-top-read user-read-recently-played';

//   const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

//   res.json({ authUrl });
// });

// // Protected route for checking authentication
// router.get('/protected', verifyToken, (req, res) => {
//   res.json({ message: 'This is a protected route', user: req.user });
// });

// // ESM-compatible export
// export default router;
