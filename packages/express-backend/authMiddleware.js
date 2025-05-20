import jwt from 'jsonwebtoken';

const TOKEN_SECRET =
  process.env.Runtime === 'test'
    ? process.env.JWT_SECRET
    : process.env.TOKEN_SECRET || 'yoursecretkey';

function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    console.log('Decoded JWT payload:', user);
    req.user = user;
    next();
  });
}

export default authenticateUser;
