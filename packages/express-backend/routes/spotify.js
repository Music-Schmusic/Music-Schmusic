import express from 'express';
import querystring from 'querystring';
import cors from 'cors';
import db_req from '../dbrequests.js';

const app = express();
app.use(cors());
const router = express.Router();

router.get('/toptracks', async (req, res) => {
    const token = "BQBfI6eFloH6WUStOMwWHfW_tIzzFPiK3oKA3Xi0gmnkzZ7mQU8JtPh9R39MidftzxAIK0fN-Rwxj5X0y3SqzBS7Tofk7O2zAOMw190HMG5sRS4Z85AmMoIvSlMP7hoQVSJRKmlZU74jhWLAhZfrX3yHr3D7Ebqa4GrhIsmJ1VBenmiMwa-tJbUUnkWGBJxzdddR8sUljLav7vh6ws88b7ftqPvhOrO1bUZZ0GNByohIIl6MA-GwTI811g";
    console.log("fetching top tracks...");
    console.log("token: ", token);

    const spotify_request = {
        url: 'https://api.spotify.com/v1/me/top/tracks',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    fetch(spotify_request.url, {
        method: spotify_request.method,
        headers: spotify_request.headers
        }).then(response => {
        console.log("response: ", response);
        return response.text();
    }).then(data => {
        console.log("Text data: ", data);
        //const jsonData = JSON.parse(data)
        res.send("Response: ").json(data);
    }).catch(error => {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    });
});

export default router;
