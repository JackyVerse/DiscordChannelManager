require('dotenv').config();
const client = require('./bot/client');
const express = require('express');
const app = express();
const PORT = 3000;

// Bot login
client.login(process.env.DISCORD_TOKEN);

// Web server
app.use(express.static('public'));
app.use(express.json());
require('./server/routes')(app, client);

app.listen(PORT, () => {
  console.log(`🌐 Web server listening at http://localhost:${PORT}`);
});