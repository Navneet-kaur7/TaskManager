# TeamFlow — Task Management System

A full-stack task management app built with React, Spring Boot, MySQL, and Docker.

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data JPA
- **Database**: MySQL 8
- **DevOps**: Docker Compose, GitHub Actions CI

---

## Quick Start with Docker

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Build backend JAR first
cd backend && mvn clean package -DskipTests && cd ..

# 3. Start everything
docker compose up --build
```

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:8080

---

## Local Development (without Docker)

### Prerequisites
- Java 17+
- Node 20+
- MySQL 8 running locally

### Backend

```bash
cd backend

# Edit src/main/resources/application.properties if needed
# Default expects MySQL at localhost:3306 with user=root, password=rootpassword

mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

The Vite dev server proxies `/api` calls to `http://localhost:8080` automatically.

---

## First-Time Setup

1. Open the app and click **Create one** to register.
2. **The very first user to register automatically becomes Admin.**
3. Log in — you'll land on the Dashboard.
4. As Admin, go to **Users** in the sidebar to add more team members.

### Sample users (after manual creation)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@teamflow.com | password123 | ADMIN |
| Jane Doe | jane@teamflow.com | password123 | USER |

---

## Project Structure

```
teamflow/
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── context/AuthContext.jsx
│       ├── utils/api.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── TaskModal.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           └── Users.jsx
│
└── backend/
    ├── Dockerfile
    ├── pom.xml
    └── src/main/java/com/teamflow/
        ├── TeamflowApplication.java
        ├── config/GlobalExceptionHandler.java
        ├── entity/         User.java, Task.java
        ├── dto/            *Request.java, *Response.java
        ├── repository/     UserRepository.java, TaskRepository.java
        ├── service/        AuthService.java, UserService.java, TaskService.java
        ├── controller/     AuthController.java, UserController.java, TaskController.java
        └── security/       JwtUtil.java, JwtFilter.java, SecurityConfig.java, UserDetailsServiceImpl.java
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Any auth | List all users |
| GET | `/api/users/{id}` | Admin | Get user by ID |
| POST | `/api/users` | Admin | Create user |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | Any auth | List tasks (filter: `?status=TODO&assignedTo=1`) |
| GET | `/api/tasks/{id}` | Any auth | Get task by ID |
| POST | `/api/tasks` | Any auth | Create task |
| PUT | `/api/tasks/{id}` | Creator/Assignee/Admin | Update task |
| DELETE | `/api/tasks/{id}` | Creator/Admin | Delete task |

---

## Authorization Rules

- **Admin**: Full access — all tasks, all users, create/delete anything
- **User**: Create tasks; update tasks they created or are assigned to; delete own tasks only
- **First registrant** is automatically promoted to Admin

---

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL password |
| `JWT_SECRET` | *(insecure default)* | **Change in production** — min 32 chars |
| `JWT_EXPIRATION` | `86400000` | Token TTL in ms (24 hours) |

---

## Database Schema (ERD)

```
users
  id          PK
  name
  email       UNIQUE
  password_hash
  role        ENUM(ADMIN, USER)
  created_at

tasks
  id          PK
  title
  description TEXT
  status      ENUM(TODO, IN_PROGRESS, DONE)
  assigned_to FK → users.id  (nullable)
  created_by  FK → users.id
  created_at
  updated_at
```

---

## Known Limitations & Future Improvements

- No refresh tokens (JWT expires after 24h, user must re-login)
- No pagination on task list
- No email verification on registration
- No audit log of task changes
- Tests are skipped in CI (`-DskipTests`) — unit/integration tests would be a good next step
