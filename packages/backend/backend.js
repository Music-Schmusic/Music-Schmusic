import express from 'express';
import querystring from 'querystring';

const app = express();
const port = 3000;
const client_id = '';
const client_secret = '';

const redirect_uri = 'http://localhost:3000/callback';

//process in JSON
app.use(express.json());

//landing page
app.get("/", function(req, res) {
    res.send("Welcome to Shmusic.");
});

//request authorization code with client secret/id
app.get("/login", function(req, res) {
    const state = 'sd5fh7nq9of4j4y6' //should be generated instead
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
app.get('/callback', function(req, res) {
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
            res.send(`Your access token: ${access_token}`);
        })
        .catch(error => {
            console.error('Error:', error); 
            res.status(400).send("Error retrieving access token");
        });
	  }
	});

app.listen(port, () => {
    console.log(
        `Shmusic listening at http://localhost:${port}`
    )
});