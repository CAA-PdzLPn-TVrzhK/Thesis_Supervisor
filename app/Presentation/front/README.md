# Thesis Supervisor - Frontend

React + Vite application for managing thesis supervisors and students.

## Setup

### Environment Variables

This project requires environment variables to be set. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project REST API URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public API key
- `VITE_AUTH_PASSWORD` - Application authentication password

**Note:** `.env.local` is gitignored and should never be committed to version control.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/            # API client and services
│   ├── client.js   # Axios client configuration
│   ├── endpoints.js # API endpoints constants
│   └── services/    # Service modules for each entity
├── config/         # Configuration files (API, env vars)
├── components/     # React components
├── lib/           # Utility functions
└── ...
```

## Configuration

API configuration is centralized in `src/config/api.js`. Import the configuration:

```javascript
import { API_URL, API_HEADERS, AUTH_PASSWORD } from '@/config/api';
```

## API Services

All API calls are centralized through service modules in `src/api/services/`. Use them instead of direct axios calls:

```javascript
import { studentsService, supervisorsService, groupsService } from '@/api/services';

const students = await studentsService.getAll();
const student = await studentsService.getById(1);
await studentsService.create({ name: 'John' });
await studentsService.update(1, { name: 'Jane' });
await studentsService.delete(1);
```

Available services:
- `studentsService` - Students CRUD operations
- `supervisorsService` - Supervisors CRUD operations
- `groupsService` - Groups CRUD operations
- `usersService` - Users CRUD operations
- `thesesService` - Theses CRUD operations
- `milestonesService` - Milestones CRUD operations
- `newStudentsService` - New students requests
- `newSupervisorsService` - New supervisors requests
