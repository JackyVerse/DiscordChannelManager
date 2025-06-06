const { Client, GatewayIntentBits } = require('discord.js');
const ready = require('./events/ready');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => ready(client));

module.exports = client;