require('dotenv').config();
const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Log environment variables for debugging
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const ChannelAction = require('./models/ChannelAction');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Should be changed in production

// Admin account configuration
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'; // Should be changed in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Should be changed in production

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token found' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Authentication check middleware for main page
const checkAuthForPage = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = user;
    next();
  });
};

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ 
      id: user._id,
      username: user.username,
      role: user.role 
    }, JWT_SECRET, { expiresIn: '24h' });

    // Store token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration route (admin only)
app.post('/register', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check authentication status route
app.get('/check-auth', authenticateToken, (req, res) => {
  res.json({ authenticated: true });
});

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Redirect to login if not authenticated
app.get('/', checkAuthForPage, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Login page route
app.get('/login', (req, res) => {
  // If already logged in, redirect to main page
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.sendFile(__dirname + '/public/login.html');
});

// Protect API routes
app.use('/api', authenticateToken);

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

// Update API routes to use /api prefix
app.get("/api/members", async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: "Server not found" });
    }

    const members = await guild.members.fetch();
    const memberList = members.map((member) => ({
      id: member.id,
      username: member.user.username,
      tag: member.user.tag,
    }));

    res.json(memberList);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Error fetching member list" });
  }
});

app.get("/api/channels", async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: "Server not found" });
    }

    const channels = await guild.channels.fetch();
    const channelList = channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
    }));

    res.json(channelList);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Error fetching channel list" });
  }
});

app.get("/api/roles", async (req, res) => {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: "Server not found" });
    }

    const roles = await guild.roles.fetch();
    const roleList = roles.map((role) => ({
      id: role.id,
      name: role.name,
    }));

    res.json(roleList);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Error fetching role list" });
  }
});

app.post("/api/add-user", async (req, res) => {
  try {
    const { userId, channelId, roleId } = req.body;
    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: "Server not found" });
    }

    const member = await guild.members.fetch(userId);
    const channel = await guild.channels.fetch(channelId);
    const role = await guild.roles.fetch(roleId);

    if (!member || !channel || !role) {
      return res.status(404).json({ error: "Member, channel, or role not found" });
    }

    await member.roles.add(role);
    await channel.permissionOverwrites.create(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    // Save action history
    const channelAction = new ChannelAction({
      userId: member.id,
      username: member.user.username,
      channelId: channel.id,
      channelName: channel.name,
      roleId: role.id,
      roleName: role.name,
      action: 'add',
      performedBy: req.user.username
    });
    await channelAction.save();

    res.json({ success: true, message: "User added to channel successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Error adding user to channel" });
  }
});

// Get action history route
app.get("/api/history", async (req, res) => {
  try {
    const history = await ChannelAction.find()
      .sort({ performedAt: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Error fetching action history" });
  }
});

// Login Discord bot
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 