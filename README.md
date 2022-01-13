# LyricsApp

A app that finds the lyrics the song currently playing on their Spotify account using Genius's search API. 

---

## Installation

Node server.
```
cd functions
yarn
cd ..
```

Build the static webpage. 
```
npm install
npm run build
```

Install Firebase and login. 
```
npm install -g firebase-tools
firebase login
```

---

## Running

To run the app locally, start the firebase emulators. 
```
firebase emulators:start
```

---

## Deployment

Deploy to Firebase Servers
```
firebase deploy
```