const path = require('path');
const express = require("express");

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.join(__dirname, '../frontend', 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
