const fs = require('fs');
const request = require('request');
const fetch = require('node-fetch');

exports.getRelease = function (req, res) {
  const projectNumber = req.projectNumber;
  const appId = 'appId';
  console.log(`req.access_token = ${req.access_token}`);
  const options = {
    accessToken : req.access_token,
    uri : `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases/`,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + req.access_token,
    }
  }

  request(options, (err, response, body) => {
    if (err) { 
      console.error(err);
    }
    const resp =  JSON.stringify(response);
    console.error('');
    res.send(resp)
  });
}

exports.listProjects = async (req, res) => {
  const uri = 'https://firebase.googleapis.com/v1beta1/projects';
  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + req.access_token,
    },
  };

  try {
    console.log(options);
    const rawResponse = await fetch(uri, options);
    const resp = await rawResponse.json();
    console.log(JSON.stringify(resp));
    res.end(JSON.stringify(resp));
    const projects = resp['projectInfo'];
    console.log('Project total: ' + projects.length);
    console.log('');
    for (let i in projects) {
      const project = projects[i];
      console.log('Project ' + i);
      console.log('ID: ' + project['project']);
      console.log('Display Name: ' + project['displayName']);
      console.log('');
    }
  } catch(err) {
    console.error(err);
  }
}