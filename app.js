const express = require('express');
const app = express();
const util = require('./util');
const generateToken = require('./createAuthToken').generateToken;
const getRelease = require('./useAuthTokenToRelease').getRelease;
const listProjects = require('./useAuthTokenToRelease').listProjects;

global.GOOGLE_APPLICATION_CREDENTIALS="./pocproject.json"


var server = app.listen(8089, () => {
  console.log('listening on port ' + 8089);
});

app.get('/', (req, res) => {
  res.end("I'm listening");
});

app.get('/generateToken', (req, res) => {
  generateToken(req, res);
});

app.get('/getRelease', (req, res) => {
  getRelease(req, res);
});

app.get('/getListProjects', (req, res) => {
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
