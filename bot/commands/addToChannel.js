const { PermissionFlagsBits } = require('discord.js');

module.exports = async function addToChannel(client, channelId, userId) {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(channelId);
    const member = await guild.members.fetch(userId);

    await channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      SendMessages: true,
      Connect: true
    });

    console.log(`✅ Added ${member.user.tag} to channel ${channel.name}`);
  } catch (err) {
    console.error('❌ Error adding user to channel:', err);
  }
};