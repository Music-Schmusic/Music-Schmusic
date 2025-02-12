import express from 'express';
import cors from 'cors';
import authRoutes from './endpoints/authorize.js';


const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/', authRoutes);

app.get('/', (req, res) => res.send('API Running'));

app.post('/signup', (req, res) => {
  try {
    const { username, email, password, spotifyid, spotifysecret } = req.body;
  }
})

app.listen(port, () => console.log(`Server running on port ${port}`));
