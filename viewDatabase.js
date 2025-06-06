require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ChannelAction = require('./models/ChannelAction');

async function viewDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // View user information
    console.log('=== USER INFORMATION ===');
    const users = await User.find().select('-password');
    console.log('Number of users:', users.length);
    console.log('User list:');
    users.forEach(user => {
      console.log(`- Username: ${user.username}, Role: ${user.role}, Last Login: ${user.lastLogin}`);
    });
    console.log('\n');

    // View channel actions information
    console.log('=== CHANNEL ACTIONS INFORMATION ===');
    const actions = await ChannelAction.find().sort({performedAt: -1}).limit(5);
    console.log('5 most recent actions:');
    actions.forEach(action => {
      console.log(`- User: ${action.username}, Channel: ${action.channelName}, Action: ${action.action}, Time: ${action.performedAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

viewDatabase(); 