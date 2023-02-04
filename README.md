# chess-web-app
## What is this?
### This is a web application that lets you play against the Stockfish chess engine
---
## Get started
### Clone this repo
```
git clone https://github.com/Solecist287/chess-web-app.git
```

### Install dependencies
#### Node version manager
[nvm - windows](https://github.com/coreybutler/nvm-windows)
[nvm - other](https://github.com/nvm-sh/nvm)

#### Frontend and server
```
npm install
```
### Concurrently run express server and frontend
```
cd server && npm run dev
```
### Open in desired browser at a port number of your choice (default is 8080)
```
localhost:8080
```
### Choose your desired settings and start the game!
---
## Tech stack
### This project uses:
- [React JavaScript library](https://reactjs.org/) to build its user interface and do client-side routing

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) to create a background thread that runs the Stockfish engine in tandem with the main application thread

- [Stockfish.js](https://github.com/exoticorn/stockfish-js) emscripten port of the aforementioned engine which was designed to be run in a web worker
---
## Thanks!
Thank you for checking out this project. I had a lot of fun making this project and hope you try it out!