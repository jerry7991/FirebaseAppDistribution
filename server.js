const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const util = require('./util');
const bodyParser = require('body-parser');
const session = require('express-session');
const request = require('request-promise');
const generateToken = require('./createAuthToken').generateToken;
const getRelease = require('./useAuthTokenToRelease').getRelease;
const listProjects = require('./useAuthTokenToRelease').listProjects;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(function (req, res, next) {
  util.readOAuthAccessToken().then(keys => {
    req.CLIENT_ID = keys.web.client_id;
    req.CLIENT_SECRET = keys.web.client_secret;
    req.REDIRECT_URI = keys.web.redirect_uris[0];
    req.access_token = keys.access_token;
    req.refersh_token = keys.refresh_token;
    console.log(`Client id ${req.CLIENT_ID}, client secret ${req.CLIENT_SECRET} and redirect URI ${req.REDIRECT_URI}`);
    next();
  });
});

app.get('/auth/google', (req, res) => {
  const SCOPE = 'email openid https://www.googleapis.com/auth/cloudplatformprojects.readonly https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform';
    const params = {
        client_id: req.CLIENT_ID,
        redirect_uri: req.REDIRECT_URI,
        scope: SCOPE,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
    }
    const authUrl =`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`
    console.log(authUrl);
    res.redirect(authUrl);
});


app.get('/', async (req, res) => {
  console.log(req);
  const code = req.query.code;
  let options = {
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    form: {
      code,
      client_id: req.CLIENT_ID,
      client_secret: req.CLIENT_SECRET,
      redirect_uri: req.REDIRECT_URI,
      grant_type: 'authorization_code'
    }
  };

  try {
    const response = await request(options);
    const tokens = JSON.parse(response);
    console.log(`Tokens returned from Google Auth ${JSON.stringify(tokens)}}`);
    util.appendKeysInKeysFile(tokens);
    util.grantRefreshToken(req, res, tokens);
    res.send(tokens);
  } catch (error) {
    res.send(`Error: Unable to exchange code for tokens ${error}`);
  }
});

app.get('/refreshToken', (req, res) => {
  req.skipWriteToFile = true;
  util.grantRefreshToken(req, res, {refresh_token: req.refersh_token});
});

app.get('/generateToken', (req, res) => {
  generateToken(req, res);
});

app.get('/getRelease', (req, res) => {
  getRelease(req, res);
});

app.get('/projects', (req, res) => {
  listProjects(req, res);
});

app.get('/getProjectAppRelease', (req, res) => {
  listProjects(req, res);
});

app.get('/getAccessToken', (req, res) => {
    res.end(JSON.stringify(util.getAccessToken()));
});

app.get('/processAuth', (req, res) => {
    res.end(JSON.stringify(util.getAccessToken()));
});

const options = {
  key: fs.readFileSync('server.key'),  // Path to your private key
  cert: fs.readFileSync('server.cert') // Path to your certificate
};

const PORT = 443;

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
