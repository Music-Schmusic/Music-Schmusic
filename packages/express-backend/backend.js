import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authorize.js';
import dbrequests from './dbrequests.js';
import AccountFuncs from './Functionality/account.js';
import db from './db.js';
import playlistCoverRoutes from './routes/playlistCoverRoutes.js';

const app = express();
const port = process.env.PORT || 8000;

dbrequests.setDataBaseConn(db());

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.get('/', (req, res) => res.send('API Running'));

app.post('/signup', async (req, res) => {
  const accountToAdd = await AccountFuncs.createAccount(req.body);
  try {
    const newAccount = await dbrequests.addAccount(accountToAdd);
    res.status(201).send(newAccount);
  } catch (error) {
    console.log(error);
    res.status(409).send('Username Already Exists');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AccountFuncs.login(username, password);
    res.status(200).json({ username: user.username, email: user.email });
  } catch (error) {
    console.log('Login Error:', error.message);
    res.status(401).send(error.message);
  }
});

app.use('/api/playlist-cover', playlistCoverRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
