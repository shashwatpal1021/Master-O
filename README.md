# Employee Task Tracker

A full-stack application for managing employee tasks with user authentication and role-based access control.

## Features

- User authentication (register, login, logout)
- Role-based access control (Admin, Manager, Employee)
- Task management (create, read, update, delete)
- Real-time updates
- Responsive design
- Containerized with Docker

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Containerization**: Docker

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (for local development without Docker)

## Getting Started

### Local Development (Without Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-task-tracker.git
   cd employee-task-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your database credentials
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### With Docker

1. **Start the application**
   ```bash
   docker compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database: PostgreSQL on port 5432

## Environment Variables

### Backend (.env)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/employee_task_tracker"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
ACCESS_TOKEN=your_access_token_secret
REFRESH_TOKEN=your_refresh_token_secret
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Docker

### Build and Run
```bash
docker compose up --build
```

### Stop Containers
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
