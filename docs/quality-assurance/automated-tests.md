# Automated Tests

This document describes the automated testing strategy, frameworks, and procedures for the Thesis Supervisor System.

## Overview

Our automated testing approach follows the testing pyramid principle, with a comprehensive suite of unit tests, integration tests, and end-to-end tests to ensure system reliability and quality.

## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  /    \
                 /  E2E  \
                /  Tests  \
               /___________\
              /             \
             /  Integration  \
            /     Tests      \
           /___________________\
          /                    \
         /      Unit Tests      \
        /________________________\
```

- **Unit Tests (70%)**: Fast, isolated tests of individual components
- **Integration Tests (20%)**: Tests of component interactions
- **End-to-End Tests (10%)**: Full user journey validation

### Test Categories

#### Unit Tests
- **Purpose**: Test individual functions, classes, and methods
- **Scope**: Single component in isolation
- **Speed**: Fast (< 1 second per test)
- **Dependencies**: Mocked or stubbed

#### Integration Tests
- **Purpose**: Test interaction between components
- **Scope**: Multiple components working together
- **Speed**: Medium (1-10 seconds per test)
- **Dependencies**: Real database, external services mocked

#### End-to-End Tests
- **Purpose**: Test complete user workflows
- **Scope**: Entire application stack
- **Speed**: Slow (10-60 seconds per test)
- **Dependencies**: Full application environment

## Test Frameworks and Tools

### Backend Testing (Python)

#### pytest
Primary testing framework for Python backend

```python
# requirements-dev.txt
pytest==7.4.0
pytest-cov==4.1.0
pytest-mock==3.11.1
pytest-asyncio==0.21.1
pytest-xdist==3.3.1
```

#### Configuration
```ini
# pytest.ini
[tool:pytest]
testpaths = app/Tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --cov=app
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=85
    --strict-markers
    --disable-warnings
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
    security: Security tests
```

### Frontend Testing (JavaScript/React)

#### Jest and Testing Library
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

#### Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### End-to-End Testing

#### Playwright
```json
{
  "devDependencies": {
    "@playwright/test": "^1.37.0"
  }
}
```

#### Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};
```

## Test Organization

### Directory Structure

```
app/
├── Tests/
│   ├── __init__.py
│   ├── conftest.py                    # pytest configuration
│   ├── unit/
│   │   ├── test_user_service.py       # Unit tests
│   │   ├── test_auth_service.py
│   │   └── test_email_service.py
│   ├── integration/
│   │   ├── test_api_endpoints.py      # Integration tests
│   │   ├── test_database_operations.py
│   │   └── test_telegram_integration.py
│   └── fixtures/
│       ├── user_data.json             # Test data
│       └── test_database.py
├── front/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentList.test.jsx   # Component tests
│   │   │   └── SupervisorProfile.test.jsx
│   │   └── utils/
│   │       └── api.test.js            # Utility tests
│   └── tests/
│       └── e2e/
│           ├── user-registration.spec.js  # E2E tests
│           ├── thesis-submission.spec.js
│           └── supervisor-review.spec.js
```

## Unit Tests

### Backend Unit Tests

#### User Service Tests
```python
# app/Tests/unit/test_user_service.py
import pytest
from unittest.mock import Mock, patch
from app.Services.UserService import UserService
from app.Domain.Entities.User import User

class TestUserService:
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.user_service = UserService()
        self.mock_user_repo = Mock()
        self.user_service.user_repo = self.mock_user_repo
    
    def test_register_user_success(self):
        """Test successful user registration."""
        # Arrange
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User",
            "role": "student"
        }
        self.mock_user_repo.get_by_email.return_value = None
        self.mock_user_repo.create.return_value = User(
            id=1, 
            email="test@example.com", 
            name="Test User"
        )
        
        # Act
        result = self.user_service.register_user(user_data)
        
        # Assert
        assert result.success is True
        assert result.user.email == "test@example.com"
        self.mock_user_repo.create.assert_called_once()
    
    def test_register_user_duplicate_email(self):
        """Test registration with duplicate email."""
        # Arrange
        user_data = {
            "email": "existing@example.com",
            "password": "password123",
            "name": "Test User",
            "role": "student"
        }
        self.mock_user_repo.get_by_email.return_value = User(
            id=1, 
            email="existing@example.com"
        )
        
        # Act
        result = self.user_service.register_user(user_data)
        
        # Assert
        assert result.success is False
        assert "already exists" in result.error_message
        self.mock_user_repo.create.assert_not_called()
    
    @pytest.mark.parametrize("invalid_email", [
        "invalid-email",
        "@example.com",
        "test@",
        ""
    ])
    def test_register_user_invalid_email(self, invalid_email):
        """Test registration with invalid email formats."""
        # Arrange
        user_data = {
            "email": invalid_email,
            "password": "password123",
            "name": "Test User",
            "role": "student"
        }
        
        # Act
        result = self.user_service.register_user(user_data)
        
        # Assert
        assert result.success is False
        assert "invalid email" in result.error_message.lower()
    
    def test_authenticate_user_success(self):
        """Test successful user authentication."""
        # Arrange
        email = "test@example.com"
        password = "password123"
        hashed_password = "hashed_password_123"
        
        mock_user = User(
            id=1,
            email=email,
            password_hash=hashed_password
        )
        self.mock_user_repo.get_by_email.return_value = mock_user
        
        with patch('app.Services.UserService.verify_password') as mock_verify:
            mock_verify.return_value = True
            
            # Act
            result = self.user_service.authenticate_user(email, password)
            
            # Assert
            assert result.success is True
            assert result.user.email == email
            mock_verify.assert_called_once_with(password, hashed_password)
    
    def test_authenticate_user_invalid_credentials(self):
        """Test authentication with invalid credentials."""
        # Arrange
        email = "test@example.com"
        password = "wrong_password"
        
        mock_user = User(
            id=1,
            email=email,
            password_hash="hashed_password_123"
        )
        self.mock_user_repo.get_by_email.return_value = mock_user
        
        with patch('app.Services.UserService.verify_password') as mock_verify:
            mock_verify.return_value = False
            
            # Act
            result = self.user_service.authenticate_user(email, password)
            
            # Assert
            assert result.success is False
            assert "invalid credentials" in result.error_message.lower()
```

#### Email Service Tests
```python
# app/Tests/unit/test_email_service.py
import pytest
from unittest.mock import Mock, patch, MagicMock
from app.Infrastructure.EmailVerification.Verifacator import EmailVerificator

class TestEmailVerificator:
    
    def setup_method(self):
        """Set up test fixtures."""
        self.email_service = EmailVerificator()
    
    @patch('smtplib.SMTP')
    def test_send_verification_email_success(self, mock_smtp):
        """Test successful email sending."""
        # Arrange
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        
        email = "test@example.com"
        verification_code = "123456"
        
        # Act
        result = self.email_service.send_verification_email(
            email, 
            verification_code
        )
        
        # Assert
        assert result.success is True
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once()
        mock_server.send_message.assert_called_once()
    
    @patch('smtplib.SMTP')
    def test_send_verification_email_smtp_error(self, mock_smtp):
        """Test email sending with SMTP error."""
        # Arrange
        mock_smtp.side_effect = Exception("SMTP connection failed")
        
        email = "test@example.com"
        verification_code = "123456"
        
        # Act
        result = self.email_service.send_verification_email(
            email, 
            verification_code
        )
        
        # Assert
        assert result.success is False
        assert "smtp" in result.error_message.lower()
    
    def test_generate_verification_code(self):
        """Test verification code generation."""
        # Act
        code = self.email_service.generate_verification_code()
        
        # Assert
        assert len(code) == 6
        assert code.isdigit()
        assert 100000 <= int(code) <= 999999
    
    def test_verify_code_success(self):
        """Test successful code verification."""
        # Arrange
        email = "test@example.com"
        code = "123456"
        
        # Store code first
        self.email_service.store_verification_code(email, code)
        
        # Act
        result = self.email_service.verify_code(email, code)
        
        # Assert
        assert result.success is True
    
    def test_verify_code_invalid(self):
        """Test verification with invalid code."""
        # Arrange
        email = "test@example.com"
        stored_code = "123456"
        provided_code = "654321"
        
        # Store code first
        self.email_service.store_verification_code(email, stored_code)
        
        # Act
        result = self.email_service.verify_code(email, provided_code)
        
        # Assert
        assert result.success is False
        assert "invalid" in result.error_message.lower()
    
    def test_verify_code_expired(self):
        """Test verification with expired code."""
        # Arrange
        email = "test@example.com"
        code = "123456"
        
        with patch('time.time') as mock_time:
            # Store code 10 minutes ago
            mock_time.return_value = 1000
            self.email_service.store_verification_code(email, code)
            
            # Try to verify now (10 minutes later)
            mock_time.return_value = 1600  # 10 minutes later
            
            # Act
            result = self.email_service.verify_code(email, code)
            
            # Assert
            assert result.success is False
            assert "expired" in result.error_message.lower()
```

### Frontend Unit Tests

#### Component Tests
```javascript
// app/front/src/components/StudentList.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentList from './StudentList';
import { api } from '../utils/api';

// Mock the API
jest.mock('../utils/api');

describe('StudentList', () => {
  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      thesis_title: 'Machine Learning in Healthcare',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      thesis_title: 'Web Development Best Practices',
      status: 'completed'
    }
  ];

  beforeEach(() => {
    api.getStudents.mockResolvedValue(mockStudents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders student list correctly', async () => {
    render(<StudentList />);
    
    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Check thesis titles
    expect(screen.getByText('Machine Learning in Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Web Development Best Practices')).toBeInTheDocument();
  });

  test('filters students by search query', async () => {
    const user = userEvent.setup();
    render(<StudentList />);
    
    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Search for specific student
    const searchInput = screen.getByPlaceholderText('Search students...');
    await user.type(searchInput, 'John');
    
    // Check filtered results
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    api.getStudents.mockRejectedValue(new Error('API Error'));
    
    render(<StudentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading students')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    render(<StudentList />);
    
    expect(screen.getByText('Loading students...')).toBeInTheDocument();
  });

  test('opens student details modal when clicked', async () => {
    const user = userEvent.setup();
    render(<StudentList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Click on student
    await user.click(screen.getByText('John Doe'));
    
    // Check modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Student Details')).toBeInTheDocument();
  });
});
```

#### Utility Function Tests
```javascript
// app/front/src/utils/api.test.js
import { api } from './api';

// Mock fetch
global.fetch = jest.fn();

describe('API utility functions', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getStudents', () => {
    test('returns students data on success', async () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com' }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      });

      const result = await api.getStudents();
      
      expect(result).toEqual(mockStudents);
      expect(fetch).toHaveBeenCalledWith('/api/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('throws error on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(api.getStudents()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('createStudent', () => {
    test('creates student successfully', async () => {
      const studentData = {
        name: 'New Student',
        email: 'new@example.com',
      };
      
      const mockResponse = { id: 1, ...studentData };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.createStudent(studentData);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
    });
  });
});
```

## Integration Tests

### API Integration Tests
```python
# app/Tests/integration/test_api_endpoints.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.Infrastructure.DataBase.Base import get_db
from app.Infrastructure.DataBase.Models.user import User

class TestUserEndpoints:
    
    def setup_method(self):
        """Set up test client and database."""
        self.client = TestClient(app)
        self.test_db = self.get_test_database()
    
    def test_register_user_endpoint(self):
        """Test user registration endpoint."""
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User",
            "role": "student"
        }
        
        response = self.client.post("/api/users/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert "password" not in data  # Password should not be returned
    
    def test_register_user_duplicate_email(self):
        """Test registration with duplicate email."""
        user_data = {
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "Test User",
            "role": "student"
        }
        
        # Register first user
        self.client.post("/api/users/register", json=user_data)
        
        # Try to register with same email
        response = self.client.post("/api/users/register", json=user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
    
    def test_login_endpoint(self):
        """Test user login endpoint."""
        # First register a user
        user_data = {
            "email": "login@example.com",
            "password": "password123",
            "name": "Login User",
            "role": "student"
        }
        self.client.post("/api/users/register", json=user_data)
        
        # Then login
        login_data = {
            "email": "login@example.com",
            "password": "password123"
        }
        
        response = self.client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_protected_endpoint_requires_auth(self):
        """Test that protected endpoints require authentication."""
        response = self.client.get("/api/users/profile")
        
        assert response.status_code == 401
        assert "not authenticated" in response.json()["detail"].lower()
    
    def test_protected_endpoint_with_valid_token(self):
        """Test protected endpoint with valid token."""
        # Register and login
        user_data = {
            "email": "protected@example.com",
            "password": "password123",
            "name": "Protected User",
            "role": "student"
        }
        self.client.post("/api/users/register", json=user_data)
        
        login_response = self.client.post("/api/auth/login", json={
            "email": "protected@example.com",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.get("/api/users/profile", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "protected@example.com"
```

### Database Integration Tests
```python
# app/Tests/integration/test_database_operations.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.Infrastructure.DataBase.Base import Base
from app.Infrastructure.DataBase.Models.user import User
from app.Infrastructure.DataBase.Repositories.UserRepo import UserRepository

class TestUserRepository:
    
    def setup_method(self):
        """Set up test database and repository."""
        # Create in-memory SQLite database for testing
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        self.user_repo = UserRepository(self.session)
    
    def teardown_method(self):
        """Clean up after each test."""
        self.session.close()
    
    def test_create_user(self):
        """Test creating a new user."""
        user_data = {
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "name": "Test User",
            "role": "student"
        }
        
        user = self.user_repo.create(user_data)
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.role == "student"
    
    def test_get_user_by_email(self):
        """Test retrieving user by email."""
        # Create user first
        user_data = {
            "email": "find@example.com",
            "password_hash": "hashed_password",
            "name": "Find User",
            "role": "student"
        }
        created_user = self.user_repo.create(user_data)
        
        # Find user by email
        found_user = self.user_repo.get_by_email("find@example.com")
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == "find@example.com"
    
    def test_get_user_by_email_not_found(self):
        """Test retrieving non-existent user by email."""
        user = self.user_repo.get_by_email("nonexistent@example.com")
        
        assert user is None
    
    def test_update_user(self):
        """Test updating user information."""
        # Create user first
        user_data = {
            "email": "update@example.com",
            "password_hash": "hashed_password",
            "name": "Update User",
            "role": "student"
        }
        user = self.user_repo.create(user_data)
        
        # Update user
        updated_data = {"name": "Updated Name"}
        updated_user = self.user_repo.update(user.id, updated_data)
        
        assert updated_user.name == "Updated Name"
        assert updated_user.email == "update@example.com"  # Unchanged
    
    def test_delete_user(self):
        """Test deleting a user."""
        # Create user first
        user_data = {
            "email": "delete@example.com",
            "password_hash": "hashed_password",
            "name": "Delete User",
            "role": "student"
        }
        user = self.user_repo.create(user_data)
        user_id = user.id
        
        # Delete user
        result = self.user_repo.delete(user_id)
        
        assert result is True
        
        # Verify user is deleted
        deleted_user = self.user_repo.get_by_id(user_id)
        assert deleted_user is None
    
    def test_get_users_by_role(self):
        """Test retrieving users by role."""
        # Create users with different roles
        student_data = {
            "email": "student@example.com",
            "password_hash": "hashed_password",
            "name": "Student User",
            "role": "student"
        }
        supervisor_data = {
            "email": "supervisor@example.com",
            "password_hash": "hashed_password",
            "name": "Supervisor User",
            "role": "supervisor"
        }
        
        self.user_repo.create(student_data)
        self.user_repo.create(supervisor_data)
        
        # Get students only
        students = self.user_repo.get_by_role("student")
        
        assert len(students) == 1
        assert students[0].role == "student"
        assert students[0].email == "student@example.com"
```

## End-to-End Tests

### User Registration Flow
```javascript
// app/front/tests/e2e/user-registration.spec.js
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('complete student registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.selectOption('[data-testid="role-select"]', 'student');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Registration successful! Please check your email for verification.'
    );
    
    // Check that user is redirected to verification page
    await expect(page).toHaveURL('/verify-email');
  });

  test('validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit with invalid email
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    
    await page.click('[data-testid="register-button"]');
    
    // Check for validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText(
      'Please enter a valid email address'
    );
  });

  test('password confirmation mismatch', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'different-password');
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toContainText(
      'Passwords do not match'
    );
  });
});
```

### Thesis Submission Flow
```javascript
// app/front/tests/e2e/thesis-submission.spec.js
import { test, expect } from '@playwright/test';

test.describe('Thesis Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'student@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('submit thesis document', async ({ page }) => {
    // Navigate to submission page
    await page.click('[data-testid="submit-thesis-button"]');
    await expect(page).toHaveURL('/submit-thesis');
    
    // Fill submission form
    await page.fill('[data-testid="thesis-title"]', 'Machine Learning in Healthcare');
    await page.fill('[data-testid="thesis-abstract"]', 'This thesis explores...');
    
    // Upload file
    const fileInput = page.locator('[data-testid="file-upload"]');
    await fileInput.setInputFiles('tests/fixtures/sample-thesis.pdf');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Wait for success
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Thesis submitted successfully'
    );
    
    // Check submission appears in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="submission-list"]')).toContainText(
      'Machine Learning in Healthcare'
    );
  });

  test('file upload validation', async ({ page }) => {
    await page.goto('/submit-thesis');
    
    // Try to upload invalid file type
    const fileInput = page.locator('[data-testid="file-upload"]');
    await fileInput.setInputFiles('tests/fixtures/invalid-file.txt');
    
    await expect(page.locator('[data-testid="file-error"]')).toContainText(
      'Please upload a PDF file'
    );
  });
});
```

## Test Data Management

### Test Fixtures
```python
# app/Tests/fixtures/test_database.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.Infrastructure.DataBase.Base import Base
from app.Infrastructure.DataBase.Models.user import User

@pytest.fixture
def test_db():
    """Create test database."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()

@pytest.fixture
def sample_user(test_db):
    """Create sample user for testing."""
    user = User(
        email="test@example.com",
        password_hash="hashed_password",
        name="Test User",
        role="student"
    )
    test_db.add(user)
    test_db.commit()
    return user

@pytest.fixture
def sample_supervisor(test_db):
    """Create sample supervisor for testing."""
    supervisor = User(
        email="supervisor@example.com",
        password_hash="hashed_password",
        name="Test Supervisor",
        role="supervisor"
    )
    test_db.add(supervisor)
    test_db.commit()
    return supervisor
```

### Test Data Files
```json
// app/Tests/fixtures/user_data.json
{
  "valid_student": {
    "email": "student@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "student"
  },
  "valid_supervisor": {
    "email": "supervisor@example.com",
    "password": "password123",
    "name": "Dr. Jane Smith",
    "role": "supervisor"
  },
  "invalid_emails": [
    "invalid-email",
    "@example.com",
    "test@",
    "",
    "test..test@example.com"
  ],
  "weak_passwords": [
    "123",
    "password",
    "12345678",
    "qwerty"
  ]
}
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run unit tests
      run: |
        pytest app/Tests/unit/ -v --cov=app --cov-report=xml
    
    - name: Run integration tests
      run: |
        pytest app/Tests/integration/ -v
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd app/front
        npm install
    
    - name: Run tests
      run: |
        cd app/front
        npm test -- --coverage --watchAll=false
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./app/front/coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd app/front
        npm install
        npx playwright install
    
    - name: Start application
      run: |
        # Start backend
        python -m pip install -r requirements.txt
        python app/main.py &
        
        # Start frontend
        cd app/front
        npm start &
        
        # Wait for services to start
        sleep 30
    
    - name: Run E2E tests
      run: |
        cd app/front
        npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: app/front/playwright-report/
```

## Test Metrics and Reporting

### Coverage Reports
```bash
# Generate coverage report
pytest --cov=app --cov-report=html --cov-report=term-missing

# View coverage in browser
open htmlcov/index.html
```

### Test Performance Monitoring
```python
# app/Tests/conftest.py
import pytest
import time
from datetime import datetime

@pytest.fixture(autouse=True)
def measure_test_performance(request):
    """Measure test execution time."""
    start_time = time.time()
    yield
    end_time = time.time()
    
    test_duration = end_time - start_time
    test_name = request.node.name
    
    # Log slow tests
    if test_duration > 5:  # 5 seconds
        print(f"SLOW TEST: {test_name} took {test_duration:.2f} seconds")
    
    # Store metrics for reporting
    with open('test_metrics.log', 'a') as f:
        f.write(f"{datetime.now()},{test_name},{test_duration:.2f}\n")
```

## Best Practices

### Test Organization
- Group related tests in classes
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Test Data
- Use fixtures for reusable test data
- Keep test data minimal and focused
- Clean up after each test
- Use factories for complex object creation

### Mocking
- Mock external dependencies
- Don't mock the system under test
- Use appropriate mock types (Mock, MagicMock, patch)
- Verify mock interactions when relevant

### Performance
- Keep unit tests fast (< 1 second)
- Use parallel test execution
- Monitor test execution time
- Optimize slow tests

### Maintenance
- Review and update tests regularly
- Remove obsolete tests
- Keep tests simple and readable
- Document complex test scenarios

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Mock Testing Guidelines](https://docs.python.org/3/library/unittest.mock.html) 