var {google} = require("googleapis");
const fs = require('fs');

// Load the service account key JSON file.
var serviceAccount = require("./pocproject.json");

// Define the required scopes.
var scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/firebase.database",
  "https://www.googleapis.com/auth/cloud-platform"
];

// Authenticate a JWT client with the service account.
var jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  scopes
);

exports.generateToken = function (req, res) {
    let accessToken = "";
    jwtClient.authorize().then((tokens) => {
        if (!tokens.access_token) {
            console.log("Provided service account does not have permission to generate access tokens");
        }
        fs.writeFileSync('./gauthToken.txt', tokens.access_token);
        res.end(JSON.stringify(tokens));
    }).catch((err) => { 
        console.log("Error making request to generate access token:", err);
        res.end({"error": err.message});
    });
}
