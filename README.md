# 💬 Messenger

A real-time instant messenger prototype built with React, Node.js, MongoDB and Socket.io.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB + Mongoose (via Docker)
- **Auth**: JWT + bcrypt

## Features

- Register / Login with JWT authentication
- Public channels — list and switch between them
- Real-time messaging via WebSockets
- Typing indicators
- Message history
- Full-text search within a channel

## Project Structure
```
messenger/
├── docker-compose.yml
├── server/
│   ├── models/        # User, Channel, Message
│   ├── routes/        # auth, channels, messages
│   ├── socket/        # Socket.io handlers
│   ├── middleware/    # JWT auth
│   ├── index.js
│   └── seed.js
└── client/
    └── src/
        ├── components/  # Sidebar, Chat, Search
        ├── context/     # AuthContext, SocketContext
        ├── pages/       # Login, Register, ChatPage
        └── api/         # Axios instance
```

## Getting Started

### 1. Start MongoDB
```bash
docker-compose up -d
```

### 2. Start Server
```bash
cd server
npm install
npm run seed
npm run dev
```

### 3. Start Client
```bash
cd client
npm install
npm run dev
```

### 4. Open
Go to **http://localhost:5173**

## Demo Accounts

| Email | Password |
|-------|----------|
| alice@demo.com | password123 |
| bob@demo.com | password123 |
| charlie@demo.com | password123 |