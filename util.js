const admin = require('firebase-admin');
const fs = require('fs');
const { google } = require('googleapis');
const keysFile = './oAuthCredentials.json';
const request = require('request');

exports.getAccessToken = function() {
  return admin.credential.applicationDefault().getAccessToken()
      .then(accessToken => {
        return accessToken.access_token;
      })
      .catch(err => {
        console.error('Unable to get access token');
        console.error(err);
      });
}

exports.readOAuthAccessToken = () => {
  return new Promise((resolve, reject) => {
    try{
        if(!fs.existsSync(keysFile)) {
          return reject(new Error(`Session file not found.`));
        }
        return resolve(JSON.parse(fs.readFileSync(keysFile)));
      }catch(err){
        return reject(err);
      }
  });
}

exports.getRouteUri = (client_id, client_secret, redirect_uri) => { 
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  // Access scopes for read-only Drive activity.
  const scopes = [
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  // Generate a url that asks permissions for the Drive activity scope
  return oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
  });
}

function appendKeysInKeysFile (newData) {
  fs.readFile(keysFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }
    const existingData = JSON.parse(data);
    const mergedData = { ...existingData, ...newData };
    console.log(`Merged data: ${mergedData}`);
    fs.writeFile(keysFile, JSON.stringify(mergedData), (err) => {
      if (err) {
        console.error('Error writing to the file:', err);
        return;
      }
      console.log('Data appended successfully!');
    });
  });
}

exports.grantRefreshToken = (req, res, tokens) => {
  // Step 1: Exchange refresh token for access token
  const options = {
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    form: {
      refresh_token: tokens.refresh_token,
      client_id: req.CLIENT_ID,
      client_secret: req.CLIENT_SECRET,
      grant_type: 'refresh_token'
    }
  };

  request(options, (error, response, body) => {
  if (error) throw new Error(error);

  const resBody = JSON.parse(body);
  // This access token wouldn't expire at all
    const accessToken = resBody.access_token;
    console.log(`accessToken is ${body}`);
    if (req.skipWriteToFile) {
      appendKeysInKeysFile({refreshAceessToken: accessToken})
    }
    res.end(JSON.stringify(resBody));
  });
}

exports.appendKeysInKeysFile = appendKeysInKeysFile;