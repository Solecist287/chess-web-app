# chess-web-app
## What is this?
### This is a web application that lets you play against the Stockfish chess engine
---
## Get started
1. Clone this repo
2. `cd client/`
3. `npm install`
4. `npm start`
5. Open in desired browser at `localhost:3000/chess-web-app`
6. Choose your desired settings and start the game!
---
## Tech stack
### This project uses:
- [React JavaScript library](https://reactjs.org/) to build its user interface and do client-side routing

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) to create a background thread that runs the Stockfish engine in tandem with the main application thread

- [Stockfish.js](https://github.com/exoticorn/stockfish-js) emscripten port of the aforementioned engine which was designed to be run in a web worker
---
## Thanks!
Thank you for checking out this project. I had a lot of fun making this project and hope you try it out!