import express from 'express';
import cors from 'cors';
import authRoutes from './endpoints/authorize.js';
import dbrequests from './db-requests.js'


const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/', authRoutes);

app.get('/', (req, res) => res.send('API Running'));

<<<<<<< Updated upstream
=======
app.post('/signup', async (req, res) => {
  const accountToAdd = AccountFuncs.createAccount(req.body);
  try {
    const newAccount = await dbrequests.addAccount(accountToAdd);
    res.status(201).send(newAccount);
  } catch (error) {
    console.log(error);
    res.status(400).send('Failed to add user.');
  }
});

>>>>>>> Stashed changes
app.listen(port, () => console.log(`Server running on port ${port}`));
