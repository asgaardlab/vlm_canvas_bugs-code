// server.js
const express = require('express');
const app = express();
const port = 3000;
const path = require("node:path")

const pathToCallGraphFile = path.resolve(__dirname + '/../../../Data/1c-Injecting_Visual_Bugs/investigation/callGraph.json')

app.use(express.static('public'));  // Serve static files from public directory
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/callGraph', (req, res) => {
  res.sendFile(pathToCallGraphFile);
});