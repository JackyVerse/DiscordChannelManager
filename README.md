# Discord Channel Manager

A web application for managing Discord channels, roles, and permissions.

## Features

- User authentication with JWT
- Discord bot integration
- Channel management
- Role management
- Member management
- Action history tracking
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Discord Bot Token
- Discord Application Client ID

## Installation

1. Clone the repository:
```bash
git clone https://github.com/angiagia/discord-channel-manager.git
cd discord-channel-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DISCORD_TOKEN=your_discord_bot_token
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
CLIENT_ID=your_discord_client_id
```

4. Create an admin user:
```bash
node createAdmin.js
```

5. Generate bot invite URL:
```bash
node generateInvite.js
```

6. Start the server:
```bash
npm start
```

## Usage

1. Access the application at `http://localhost:3000`
2. Log in with your admin credentials
3. Use the interface to manage Discord channels and roles

## Scripts

- `createAdmin.js`: Create a new admin user
- `updateAdmin.js`: Update admin password
- `viewDatabase.js`: View database contents
- `getIP.js`: Get server IP address
- `generateInvite.js`: Generate bot invite URL

## Security

- JWT authentication
- Password hashing with bcrypt
- MongoDB connection with proper security settings
- Environment variables for sensitive data

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
