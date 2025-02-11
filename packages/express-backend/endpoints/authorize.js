import express from 'express';
import querystring from 'querystring';

const app = express();
const router = express.Router();
const port = 3000;

let client_id = '';
let client_secret = '';
const redirect_uri = 'http://localhost:8000/callback';

//request authorization code with client secret/id
router.get("/login/:id/:secret", function(req, res) {
    client_id = req.params.id;
    client_secret = req.params.secret;

    //authorization code request parameters
    const state = generateState(16); 
    const scope = 'user-read-private user-read-email';
    const auth_query = querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
      console.log("\nauthorization query being sent:\n", auth_query);

    //prompts user to allow the app to access data
    res.redirect('https://accounts.spotify.com/authorize?' +
        auth_query);
});

//recieve authorization code and request access tokens 
router.get('/callback', function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;

    //security feature, in case of cross-site request forgery
    if (state === null) {
        console.log("State Mismatch");
        res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
    }
    else {
        const authOptions = {
            url: 
                'https://accounts.spotify.com/api/token',
            method: 
                'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            body: 
                new URLSearchParams({
                code: code,
                redirect_uri: redirect_uri, 
                grant_type: 'authorization_code' 
            })
          };
        var access_token = '';
          
        //request access token
        fetch(authOptions.url, {
                method: authOptions.method,
                headers: authOptions.headers,
                body: authOptions.body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(json => {
            access_token = json.access_token;
            res.send(json);
        })
        .catch(error => {
            console.error('Error:', error); 
            res.status(500).send("Error retrieving access token");
        });
      }
    });

//generate random string 
function generateState(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    let count = 0;
    while (count < length){
        state += characters.charAt(Math.floor(Math.random() * characters.length))
        count++; 
    }
    return state;
}

export default router;