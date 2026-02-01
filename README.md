# Astral Social

A modern real-time social network with posts, follows, search, notifications, and private messaging.

## Tech Stack
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Zustand, Socket.IO client
- Backend: Node.js + Express, Socket.IO, JWT, MongoDB (Mongoose)

## Features
- Register, Login, JWT protected routes, auto-login on refresh
- User search, follow/unfollow, private follow requests, mute
- Profile privacy, cover + avatar, pinned posts
- Feed with posts, likes, comments, reposts, bookmarks, hide, pin
- Hashtag search
- Realtime notifications (likes, comments, follows, requests, reposts, messages)
- Realtime DMs with typing indicators, read receipts, edits, deletes, reactions

## Environment Variables
Create the following files:

`server/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/astral
JWT_SECRET=supersecret
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env`
```
VITE_API_URL=http://localhost:5000
```

## Install & Run
From the project root:

### 1) Backend
```
cd server
npm install
npm run dev
```

### 2) Frontend
```
cd client
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints
### Auth
- POST `/auth/register`
- POST `/auth/login`
- GET `/auth/me`

### Users
- GET `/users/search`
- GET `/users/:id`
- PUT `/users/me`
- PUT `/users/me/avatar`
- PUT `/users/me/cover`
- GET `/users/me/bookmarks`
- GET `/users/me/hidden`
- GET `/users/me/follow-requests`
- POST `/users/:id/follow`
- POST `/users/:id/unfollow`
- POST `/users/:id/approve`
- POST `/users/:id/deny`
- POST `/users/:id/mute`
- POST `/users/:id/unmute`

### Posts
- POST `/posts`
- GET `/posts/feed`
- GET `/posts/user/:id`
- POST `/posts/:id/like`
- POST `/posts/:id/comment`
- POST `/posts/:id/repost`
- POST `/posts/:id/bookmark`
- POST `/posts/:id/hide`
- POST `/posts/:id/unhide`
- POST `/posts/:id/pin`
- POST `/posts/:id/unpin`

### Search
- GET `/search?query=...`

### Notifications
- GET `/notifications`
- POST `/notifications/read`

### Conversations
- POST `/conversations/create`
- GET `/conversations`

### Messages
- POST `/messages` (multipart for file/image)
- GET `/messages/:conversationId`
- PATCH `/messages/:id`
- DELETE `/messages/:id`
- POST `/messages/:id/react`

## Notes
- File uploads are served from `/uploads` on the backend.
- Socket.IO is authenticated via the JWT in the handshake.
