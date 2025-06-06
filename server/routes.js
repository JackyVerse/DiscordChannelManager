const addToChannel = require('../bot/commands/addToChannel');

module.exports = (app, client) => {
  app.post('/add-user', async (req, res) => {
    const { userId, channelId, roleId } = req.body;
    try {
      await addToChannel(client, channelId, userId, roleId);
      // Gán role nếu có roleId
      if (roleId) {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        try {
          await member.roles.add(roleId);
          console.log(`✅ Gán role ${roleId} cho user ${userId}`);
        } catch (err) {
          console.error(`❌ Không thể gán role:`, err);
        }
      }
      res.status(200).json({ success: true, message: "User added successfully!" });
    } catch (err) {
      console.error("❌ Error adding user:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app.get('/channels', async (req, res) => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const channels = await guild.channels.fetch();
      console.log("channels: ", channels);
  
      // Lọc ra chỉ các channel text/voice có thể dùng
      const filtered = [];
      channels.forEach((channel) => {
        if (channel.type === 0 || channel.type === 2) { // 0: text, 2: voice
          filtered.push({ 
            id: channel.id, 
            name: channel.name,
            type: channel.type // 0: text, 2: voice
          });
        }
      });
  
      res.json(filtered);
    } catch (err) {
      console.error("❌ Error fetching channels:", err);
      res.status(500).json({ message: "Failed to get channels" });
    }
  });
  app.get('/roles', async (req, res) => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const roles = await guild.roles.fetch();

      const filtered = [];
      roles.forEach((role) => {
        // Bỏ @everyone và bot roles nếu cần
        if (!role.managed && role.name !== '@everyone') {
          filtered.push({ id: role.id, name: role.name });
        }
      });

      res.json(filtered);
    } catch (err) {
      console.error("❌ Error fetching roles:", err);
      res.status(500).json({ message: "Failed to get roles" });
    }
  });
  app.get('/members', async (req, res) => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const members = await guild.members.fetch();

      const filtered = [];
      members.forEach((member) => {
        // Bỏ bot nếu cần
        if (!member.user.bot) {
          filtered.push({ 
            id: member.id, 
            username: member.user.username,
            tag: member.user.tag
          });
        }
      });

      res.json(filtered);
    } catch (err) {
      console.error("❌ Error fetching members:", err);
      res.status(500).json({ message: "Failed to get members" });
    }
  });
};