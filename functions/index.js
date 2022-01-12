// Environment Variables
require("dotenv").config();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
var redirect_uri;

if (process.platform === "win32") {
  redirect_uri = process.env.DEV_HOST_NAME + ":" + process.env.DEV_PORT + "/callback";
} else {
  redirect_uri = process.env.PROD_HOST_NAME + "/callback";
}

const GENIUS_KEY = process.env.GENIUS_KEY;
const genius_search_url = "https://api.genius.com/search?q=";

// Firebase
const functions = require("firebase-functions");

// Express app
const path = require("path");
const express = require("express");
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");

// Cleans artist and song title of unnecessary characters for better search results.
function clean(str) {
  return (
    str
      .toLowerCase()
      .replace(/ *\([^)]*\) */g, "") // Anything between ().
      .replace(/ *\[[^\]]*]/g, "") // Anything between [].
      .replace(/feat\.|ft\./g, "") // feat. | ft.
      //.replace(/\s+/g, " ") // Whitespace
      .replace(/ - (.*)/g, "") // Anything after a " - ", e.g. " - From the motion picture...""
      .trim() // Trim whitespace
  );
}

// Create express app
const app = express();

// Add middlewares
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
app.use(cors());
app.use(cookieParser());

// Login endpoint for Spotify
app.get("/login", function (req, res) {
  // your application requests authorization
  var scope = "user-read-private user-read-email user-read-playback-state";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  );
});

// Callback endpoint for Spotify
app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  var code = req.query.code || null;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization: "Basic " + new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token;

      // we can also pass the token to the browser to make requests from there
      res.redirect(
        "/#" +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
          })
      );
    } else {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
});

// Lyrics endpoint to get the Genius webpage.
app.get("/lyrics", function (req, res) {
  console.log(req.query);
  const { song, artist } = req.query;

  const search_str = `${clean(song)} ${clean(artist)}`;
  const reqUrl = `${genius_search_url}${encodeURI(search_str)}&access_token=${GENIUS_KEY}`;
  request.get(reqUrl, { json: true }, function (err, response, body) {
    var genius_url;
    if (body.response.hits.length !== 0) {
      genius_url = body.response.hits[0].result.url;
      console.log(genius_url);
    } else {
      genius_url = null;
    }

    request.get(genius_url, function (e, r, b) {
      res.send(b);
    });
  });
});

// '/' endpoint for static React app.
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// Export Express app
exports.app = functions.https.onRequest(app);
