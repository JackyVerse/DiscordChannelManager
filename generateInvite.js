require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

// Generate bot invite URL
const permissions = new PermissionsBitField([
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.SendMessages,
  PermissionsBitField.Flags.ReadMessageHistory,
  PermissionsBitField.Flags.ManageRoles,
  PermissionsBitField.Flags.ManageChannels
]);

const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=${permissions.bitfield}&scope=bot%20applications.commands`;

console.log('Bot invite URL:', inviteUrl);
console.log('\nUse this URL to invite the bot to your server.');
console.log('After inviting the bot, restart the server with: npm start'); 