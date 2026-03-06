require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Channel  = require('./models/Channel');
const Message  = require('./models/Message');

const USERS = [
  { username: 'alice',   email: 'alice@demo.com',   password: 'password123' },
  { username: 'bob',     email: 'bob@demo.com',     password: 'password123' },
  { username: 'charlie', email: 'charlie@demo.com', password: 'password123' },
];

const CHANNELS = [
  { name: 'general',      description: 'General discussion' },
  { name: 'random',       description: 'Random stuff' },
  { name: 'tech-talk',    description: 'Technology discussions' },
  { name: 'announcements',description: 'Important announcements' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany(), Channel.deleteMany(), Message.deleteMany()]);

  const users = await Promise.all(USERS.map(async u => {
    const passwordHash = await bcrypt.hash(u.password, 10);
    return User.create({ username: u.username, email: u.email, passwordHash });
  }));
  console.log(`✅ Created ${users.length} users`);

  const channels = await Promise.all(CHANNELS.map(c =>
    Channel.create({ ...c, createdBy: users[0]._id, members: users.map(u => u._id) })
  ));
  console.log(`✅ Created ${channels.length} channels`);

  const sampleMessages = [
    'Hey everyone! 👋',
    'Welcome to the messenger!',
    'This is built with React + Node.js + MongoDB',
    'Socket.io powers the real-time messaging',
    'Try searching for messages using the search bar',
    'You can switch between channels on the left',
    'Pretty cool, right? 🚀',
    'Feel free to send messages!',
    'The tech stack is awesome',
    'MongoDB makes it easy to store messages',
  ];

  const messages = [];
  for (const channel of channels) {
    for (let i = 0; i < sampleMessages.length; i++) {
      messages.push({
        channelId: channel._id,
        userId: users[i % users.length]._id,
        text: sampleMessages[i],
        createdAt: new Date(Date.now() - (sampleMessages.length - i) * 60000),
      });
    }
  }
  await Message.insertMany(messages);
  console.log(`✅ Created ${messages.length} messages`);

  console.log('\n📋 Demo accounts:');
  USERS.forEach(u => console.log(`  ${u.email} / ${u.password}`));

  await mongoose.disconnect();
  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);