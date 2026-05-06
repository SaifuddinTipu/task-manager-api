# Task Manager API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)

> Task management REST API with real-time Socket.io updates, advanced filtering, soft delete, and JWT refresh token rotation.

🚀 **Live:** DEPLOYED_URL_PLACEHOLDER
📖 **Base URL:** DEPLOYED_URL_PLACEHOLDER/api

---

## Features

- Full CRUD for tasks with soft delete
- Advanced filtering: status, priority, search, tags, due date
- Pagination and sorting
- Real-time updates via Socket.io (task created/updated/deleted events)
- JWT authentication with refresh token rotation
- MongoDB TTL index auto-expires refresh tokens
- Rate limiting with `express-rate-limit`

## Tech Stack

| Layer       | Technology            |
|-------------|-----------------------|
| Framework   | Express + TypeScript  |
| Database    | MongoDB (Mongoose)    |
| Real-time   | Socket.io             |
| Auth        | JWT (jsonwebtoken)    |
| Tests       | Jest + ts-jest        |

## API Endpoints

| Method | Path                    | Auth     | Description                     | Example Body                          |
|--------|-------------------------|----------|---------------------------------|---------------------------------------|
| POST   | /api/auth/register      | None     | Register user                   | `{"email":"","password":""}`          |
| POST   | /api/auth/login         | None     | Login                           | `{"email":"","password":""}`          |
| POST   | /api/auth/refresh       | None     | Refresh tokens                  | `{"refreshToken":""}`                 |
| POST   | /api/auth/logout        | None     | Logout                          | `{"refreshToken":""}`                 |
| GET    | /api/tasks              | Bearer   | List tasks (with filters)       | —                                     |
| GET    | /api/tasks/stats        | Bearer   | Task statistics                 | —                                     |
| GET    | /api/tasks/:id          | Bearer   | Get single task                 | —                                     |
| POST   | /api/tasks              | Bearer   | Create task                     | `{"title":"","priority":"high"}`      |
| PATCH  | /api/tasks/:id          | Bearer   | Update task                     | `{"status":"done"}`                   |
| DELETE | /api/tasks/:id          | Bearer   | Soft delete task                | —                                     |

## Filtering Examples

```bash
# Filter by status
GET /api/tasks?status=in_progress

# Search by title + priority
GET /api/tasks?search=bug&priority=high

# Due before a date, sorted by dueDate
GET /api/tasks?dueBefore=2024-12-31&sort=dueDate&order=asc

# Pagination
GET /api/tasks?page=2&limit=10
```

## Socket.io Events

| Event         | Direction       | Payload                         |
|---------------|-----------------|---------------------------------|
| `task:created`| Server → Client | Task object                     |
| `task:updated`| Server → Client | Updated task object             |
| `task:deleted`| Server → Client | `{ taskId: string }`            |

Connect with: `io(URL, { auth: { token: 'Bearer ...' } })`

## Quick Start

```bash
# 1. Clone
git clone https://github.com/SaifuddinTipu/task-manager-api.git
cd task-manager-api

# 2. Configure
cp .env.example .env

# 3. Start MongoDB
docker compose up -d

# 4. Install & run
npm install
npm run dev
```

## Running Tests

```bash
npm test
npm run test:coverage
```

## License

MIT
