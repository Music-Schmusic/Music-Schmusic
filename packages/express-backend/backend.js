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

app.listen(port, () => console.log(`Server running on port ${port}`));
