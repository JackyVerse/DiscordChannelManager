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

    console.log(`✅ Đã thêm ${member.user.tag} vào channel ${channel.name}`);
  } catch (err) {
    console.error('❌ Lỗi khi thêm user vào channel:', err);
  }
};