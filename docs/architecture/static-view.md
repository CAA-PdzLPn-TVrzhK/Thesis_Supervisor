# Static View - System Structure

This document describes the static structure of the Thesis Supervisor System, including components, their relationships, and the overall system architecture.

## Overview

The static view represents the system's structural organization at runtime, showing how components are arranged and how they interact with each other. The system follows a layered architecture pattern with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                         API Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                       Service Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                      Repository Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Presentation Layer

#### Web Frontend
```
app/front/
├── src/
│   ├── components/
│   │   ├── student_list.jsx           # Student management interface
│   │   ├── supervisor_list.jsx        # Supervisor management interface
│   │   ├── group_list.jsx             # Group management interface
│   │   ├── studentProfile.jsx         # Student profile component
│   │   └── supervisorProfile.jsx      # Supervisor profile component
│   ├── App.jsx                        # Main application component
│   ├── index.jsx                      # Application entry point
│   └── main_page.jsx                  # Main landing page
├── index.html                         # HTML template
├── package.json                       # Dependencies and scripts
└── vite.config.js                     # Build configuration
```

**Responsibilities:**
- User interface rendering
- User interaction handling
- API communication
- State management
- Form validation

**Dependencies:**
- React 18.2+
- Vite build tool
- Axios for HTTP requests
- React Router for navigation

#### Telegram Bot Interface
```
app/Api/Telegram_Api/
├── __init__.py
├── Bot.py                             # Main bot implementation
└── webapp/
    └── mini_app.py                    # Mini app interface
```

**Responsibilities:**
- Telegram bot command handling
- Webhook processing
- Mini app integration
- Push notifications
- Mobile interface

**Dependencies:**
- python-telegram-bot library
- FastAPI for webhook handling
- Async/await for non-blocking operations

### API Layer

#### FastAPI Application
```
app/
├── main.py                            # Application entry point
├── config.py                          # Configuration management
└── Api/
    └── Telegram_Api/
        ├── Bot.py                     # Telegram API endpoints
        └── webapp/
            └── mini_app.py            # Mini app endpoints
```

**Responsibilities:**
- HTTP request/response handling
- API endpoint routing
- Request validation
- Response formatting
- Middleware processing

**Key Features:**
- RESTful API design
- OpenAPI documentation
- Request/response validation
- Error handling
- CORS configuration

#### Authentication Middleware
```python
# Conceptual structure
@app.middleware("http")
async def authentication_middleware(request: Request, call_next):
    """JWT authentication middleware"""
    # Token validation
    # User context setting
    # Permission checking
    response = await call_next(request)
    return response
```

**Responsibilities:**
- JWT token validation
- User authentication
- Session management
- Permission enforcement
- Security headers

### Service Layer

#### Core Services
```
app/Services/
├── __init__.py
└── UserService.py                     # User management service
```

**User Service Responsibilities:**
- User registration and authentication
- Profile management
- Role-based access control
- Email verification
- Password management

**Additional Services (Conceptual):**
- `ThesisService`: Thesis submission and management
- `ReviewService`: Review workflow management
- `NotificationService`: Email and push notifications
- `FileService`: Document upload and storage
- `ReportService`: Analytics and reporting

### Repository Layer

#### Data Access Layer
```
app/Infrastructure/DataBase/Repositories/
├── __init__.py
└── UserRepo.py                        # User data access
```

**Responsibilities:**
- Database query execution
- Data mapping and transformation
- Connection management
- Transaction handling
- Query optimization

**Repository Pattern Benefits:**
- Separation of data access logic
- Testability through mocking
- Consistent data access interface
- Easy database switching

### Data Layer

#### Database Infrastructure
```
app/Infrastructure/DataBase/
├── __init__.py
├── Base.py                            # Database configuration
├── session.py                         # Session management
├── init_db.py                         # Database initialization
├── ExampleOfUsage.py                  # Usage examples
└── Models/
    ├── __init__.py
    └── user.py                        # User entity model
```

**Database Components:**
- SQLAlchemy ORM for data modeling
- Connection pooling
- Migration system
- Backup and recovery
- Performance monitoring

#### External Services
```
app/Infrastructure/
├── DataBase/                          # Database integration
└── EmailVerification/
    ├── __init__.py
    └── Verifacator.py                 # Email service integration
```

## Component Relationships

### Dependency Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Presentation   │───▶│      API        │───▶│    Service      │
│     Layer       │    │     Layer       │    │     Layer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Layer    │◀───│   Repository    │◀───│    Service      │
│                 │    │     Layer       │    │     Layer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Communication Patterns

#### Request Flow
1. **User Action**: User interacts with frontend
2. **API Request**: Frontend sends HTTP request to API
3. **Service Call**: API layer calls appropriate service
4. **Data Access**: Service calls repository for data
5. **Database Query**: Repository executes database operations
6. **Response**: Data flows back through all layers

#### Telegram Bot Flow
1. **Webhook**: Telegram sends webhook to bot
2. **Command Processing**: Bot processes command
3. **Service Integration**: Bot calls backend services
4. **Response**: Bot sends response to user

### Interface Definitions

#### API Contracts
```typescript
// User API interface
interface UserAPI {
  register(userData: UserRegistrationData): Promise<User>;
  login(credentials: LoginCredentials): Promise<AuthToken>;
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, updates: UserUpdates): Promise<User>;
}

// Thesis API interface
interface ThesisAPI {
  submit(thesisData: ThesisSubmissionData): Promise<Thesis>;
  getStatus(thesisId: string): Promise<ThesisStatus>;
  review(thesisId: string, review: ReviewData): Promise<Review>;
  getReviews(thesisId: string): Promise<Review[]>;
}
```

#### Service Interfaces
```python
# User Service interface
class IUserService(ABC):
    @abstractmethod
    async def register_user(self, user_data: UserRegistrationData) -> User:
        pass
    
    @abstractmethod
    async def authenticate_user(self, email: str, password: str) -> AuthResult:
        pass
    
    @abstractmethod
    async def get_user_profile(self, user_id: str) -> UserProfile:
        pass
```

## Data Models

### Domain Entities

#### User Entity
```python
@dataclass
class User:
    id: UUID
    email: str
    name: str
    role: UserRole
    created_at: datetime
    updated_at: datetime
    is_active: bool
    email_verified: bool
```

#### Thesis Entity
```python
@dataclass
class Thesis:
    id: UUID
    title: str
    abstract: str
    status: ThesisStatus
    student_id: UUID
    supervisor_id: UUID
    created_at: datetime
    updated_at: datetime
    deadline: datetime
    submitted_at: Optional[datetime]
```

#### Review Entity
```python
@dataclass
class Review:
    id: UUID
    thesis_id: UUID
    reviewer_id: UUID
    score: int
    feedback: str
    created_at: datetime
    updated_at: datetime
    review_type: ReviewType
```

### Database Schema

#### Entity Relationships
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

-- Theses table
CREATE TABLE theses (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    status VARCHAR(50) NOT NULL,
    student_id UUID REFERENCES users(id),
    supervisor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    submitted_at TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    thesis_id UUID REFERENCES theses(id),
    reviewer_id UUID REFERENCES users(id),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_type VARCHAR(50) NOT NULL
);
```

## Configuration Management

### Environment Configuration
```python
# app/config.py structure
class Config:
    # Database configuration
    DATABASE_URL: str
    
    # Email configuration
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    
    # Telegram configuration
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_WEBHOOK_URL: str
    
    # Security configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_EXPIRATION_HOURS: int
    
    # Application configuration
    DEBUG: bool
    LOG_LEVEL: str
    CORS_ORIGINS: List[str]
```

### Dependency Injection
```python
# Dependency injection container
class Container:
    def __init__(self):
        self.config = Config()
        self.db_session = SessionLocal()
        self.user_repository = UserRepository(self.db_session)
        self.user_service = UserService(self.user_repository)
        self.email_service = EmailService(self.config)
```

## Security Architecture

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│     API     │───▶│   Service   │
│             │    │ Middleware  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    JWT      │    │ Token       │    │    User     │
│   Token     │    │ Validation  │    │   Context   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Authorization Layers
1. **Network Security**: HTTPS, CORS, rate limiting
2. **Authentication**: JWT token validation
3. **Authorization**: Role-based access control
4. **Data Security**: Input validation, SQL injection prevention

## Performance Considerations

### Caching Strategy
```python
# Multi-level caching
class CacheManager:
    def __init__(self):
        self.l1_cache = {}  # In-memory cache
        self.l2_cache = redis.Redis()  # Redis cache
        self.l3_cache = "database"  # Database
```

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Read replicas for scaling

### Frontend Optimization
- Code splitting
- Lazy loading
- Asset optimization
- CDN integration

## Error Handling

### Exception Hierarchy
```python
class ThesisSupervisorException(Exception):
    """Base exception for all application errors"""
    pass

class ValidationError(ThesisSupervisorException):
    """Validation errors"""
    pass

class AuthenticationError(ThesisSupervisorException):
    """Authentication errors"""
    pass

class AuthorizationError(ThesisSupervisorException):
    """Authorization errors"""
    pass
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2023-12-29T10:30:00Z"
  }
}
```

## Testing Strategy

### Test Structure
```
app/Tests/
├── unit/                              # Unit tests
│   ├── test_user_service.py
│   └── test_email_service.py
├── integration/                       # Integration tests
│   ├── test_api_endpoints.py
│   └── test_database_operations.py
└── fixtures/                          # Test data
    ├── user_data.json
    └── test_database.py
```

### Test Patterns
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full workflow testing
- **Contract Tests**: API contract validation

## Deployment Architecture

### Container Structure
```dockerfile
# Multi-stage build
FROM python:3.9-slim AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
EXPOSE 8000
CMD ["python", "app/main.py"]

FROM node:16-alpine AS frontend
WORKDIR /app
COPY app/front/package*.json ./
RUN npm install
COPY app/front/ .
RUN npm run build
```

### Service Architecture
```yaml
# docker-compose.yml structure
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/thesis_db
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=thesis_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Monitoring and Observability

### Metrics Collection
```python
# Application metrics
from prometheus_client import Counter, Histogram, Gauge

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests')
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'Request duration')
ACTIVE_USERS = Gauge('active_users_count', 'Number of active users')
```

### Logging Strategy
```python
# Structured logging
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': record.created,
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName
        }
        return json.dumps(log_entry)
```

## Conclusion

The static view of the Thesis Supervisor System demonstrates a well-structured, layered architecture that promotes:

- **Separation of Concerns**: Clear boundaries between layers
- **Maintainability**: Modular design for easy updates
- **Testability**: Components can be tested in isolation
- **Scalability**: Architecture supports horizontal scaling
- **Security**: Multiple layers of security controls

This structure provides a solid foundation for the system's functionality while remaining flexible enough to accommodate future enhancements and changes. 