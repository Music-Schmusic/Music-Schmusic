import express from 'express';
import authRoutes from './endpoints/authorize.js';

const app = express();

//process in JSON
app.use(express.json());

app.use('/',authRoutes);

const port = 3000;
const client_id = '';
const client_secret = '';

const redirect_uri = 'http://localhost:3000/callback';

//landing page
app.get("/", function(req, res) {
    res.send("Welcome to Shmusic.");
});

app.listen(port, () => {
    console.log(
        `Shmusic listening at http://localhost:${port}`
    )
});