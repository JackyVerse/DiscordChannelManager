const { PermissionsBitField } = require('discord.js');

function grantAccess(member) {
  return {
    ViewChannel: true,
    SendMessages: true,
    Connect: true
  };
}

module.exports = { grantAccess };