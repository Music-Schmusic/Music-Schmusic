import express from 'express';
import cors from 'cors';
import authRoutes from './endpoints/authorize.js';
import dbrequests from './dbrequests.js';
import AccountFuncs from './Functionality/account.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/', authRoutes);

app.get('/', (req, res) => res.send('API Running'));

app.post('/signup', async (req, res) => {
  const accountToAdd = AccountFuncs.createAccount(req.body);
  try {
    const newAccount = await dbrequests.addAccount(accountToAdd);
    res.status(201).send(newAccount);
  } catch (error) {
    console.log(error);
    res.status(409).send('Username Already Exists');
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
