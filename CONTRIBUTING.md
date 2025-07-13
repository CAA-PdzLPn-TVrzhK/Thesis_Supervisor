# Contributing to Thesis Supervisor System

Thank you for your interest in contributing to the Thesis Supervisor System! This document provides guidelines and instructions for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Kanban Board](#kanban-board)
- [Secrets Management](#secrets-management)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ (for frontend development)
- Git
- Text editor or IDE (VS Code recommended)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/YOUR-USERNAME/thesis_supervisor.git
   cd thesis_supervisor
   ```

2. **Set up Remote**
   ```bash
   # Add upstream remote
   git remote add upstream https://github.com/original-owner/thesis_supervisor.git
   ```

3. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install development dependencies
   pip install -r requirements-dev.txt
   
   # Initialize database
   python app/Infrastructure/DataBase/init_db.py
   ```

4. **Frontend Setup**
   ```bash
   cd app/front
   npm install
   npm run dev
   ```

5. **Environment Configuration**
   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Git Workflow

We follow **GitHub Flow** with some adaptations for our team:

### Branch Strategy

- **main**: Production-ready code
- **feature/[issue-number]-[short-description]**: Feature development
- **bugfix/[issue-number]-[short-description]**: Bug fixes
- **hotfix/[issue-number]-[short-description]**: Critical production fixes

### Branching Process

1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/123-user-authentication
   ```

2. **Make Changes**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat(auth): implement user authentication"
   ```

3. **Keep Branch Updated**
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/123-user-authentication
   git rebase main
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/123-user-authentication
   # Create pull request on GitHub
   ```

### Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user registration endpoint
fix(database): resolve connection timeout issues
docs(readme): update installation instructions
test(auth): add unit tests for login functionality
```

## Coding Standards

### Python Code Style

- Follow [PEP 8](https://pep8.org/) style guide
- Use [Black](https://black.readthedocs.io/) for code formatting
- Use [flake8](https://flake8.pycqa.org/) for linting
- Maximum line length: 88 characters

**Pre-commit Setup:**
```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install
```

### JavaScript/React Code Style

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use [ESLint](https://eslint.org/) for linting
- Use [Prettier](https://prettier.io/) for formatting
- Use functional components with hooks

### Code Quality Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Code is properly documented
- [ ] No linting errors
- [ ] Security best practices followed
- [ ] Performance considerations addressed

## Testing

### Running Tests

```bash
# Run all tests
python -m pytest

# Run tests with coverage
python -m pytest --cov=app

# Run specific test file
python -m pytest app/Tests/test_user_service.py

# Run frontend tests
cd app/front
npm test
```

### Test Requirements

- **Unit Tests**: Required for all new functions and classes
- **Integration Tests**: Required for API endpoints and database operations
- **Coverage**: Minimum 80% code coverage for new code
- **Test Naming**: Use descriptive test names (e.g., `test_user_registration_with_valid_email`)

### Test Structure

```python
# Test file: app/Tests/test_user_service.py
import pytest
from app.Services.UserService import UserService

class TestUserService:
    def test_register_user_with_valid_data(self):
        # Arrange
        user_data = {"email": "test@example.com", "password": "password123"}
        
        # Act
        result = UserService.register_user(user_data)
        
        # Assert
        assert result.success is True
        assert result.user_id is not None
```

## Documentation

### Documentation Requirements

- **Docstrings**: All functions and classes must have docstrings
- **README Updates**: Update README.md for new features
- **API Documentation**: Document API endpoints in OpenAPI format
- **Architecture Docs**: Update architecture diagrams when needed

### Docstring Format

```python
def register_user(user_data: dict) -> UserRegistrationResult:
    """
    Register a new user in the system.
    
    Args:
        user_data (dict): User registration data including email and password
        
    Returns:
        UserRegistrationResult: Result object containing success status and user ID
        
    Raises:
        ValidationError: If user data is invalid
        EmailExistsError: If email is already registered
        
    Example:
        >>> user_data = {"email": "test@example.com", "password": "password123"}
        >>> result = register_user(user_data)
        >>> print(result.success)
        True
    """
```

## Pull Request Process

### PR Requirements

1. **Issue Reference**: PR must reference an existing issue
2. **Description**: Clear description of changes made
3. **Testing**: All tests must pass
4. **Review**: At least one approval required
5. **Documentation**: Update documentation if needed

### PR Template

```markdown
## Description
Brief description of changes made.

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI pipeline must pass
2. **Code Review**: Focus on functionality, performance, security
3. **Testing**: Verify tests cover new functionality
4. **Documentation**: Ensure docs are updated
5. **Approval**: Require at least one approval
6. **Merge**: Use squash merge to main

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]

## Screenshots
Add screenshots if applicable.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions considered.

## Additional Context
Any other context or screenshots.
```

## Kanban Board

We use [GitHub Projects](https://github.com/your-username/thesis_supervisor/projects/1) for project management.

### Column Definitions

- **Backlog**: New items not yet prioritized
- **To Do**: Ready for development, estimated and assigned
- **In Progress**: Currently being worked on
- **Code Review**: Awaiting peer review
- **Testing**: Undergoing QA testing
- **Done**: Complete and deployed

### Column Entry Criteria

**To Do → In Progress**
- Issue assigned to developer
- Acceptance criteria defined
- Technical approach agreed upon

**In Progress → Code Review**
- Feature implementation complete
- Unit tests added
- Self-review completed

**Code Review → Testing**
- Code review approved
- CI pipeline passes
- Branch merged to main

**Testing → Done**
- QA testing complete
- Feature deployed to production
- Acceptance criteria met

## Secrets Management

### Security Guidelines

- **Never commit secrets**: Use `.env` files (gitignored)
- **Environment Variables**: Store sensitive data in environment variables
- **Production Secrets**: Use cloud secret management services
- **Key Rotation**: Rotate API keys and tokens regularly

### Secret Types

- **Database Credentials**: Connection strings, passwords
- **API Keys**: Third-party service keys
- **JWT Secrets**: Token signing secrets
- **Email Credentials**: SMTP configuration

### Storage Locations

- **Development**: Local `.env` files
- **Staging**: Cloud secret management
- **Production**: Cloud secret management
- **CI/CD**: Repository secrets

### Example .env File

```env
# Database
DATABASE_URL=sqlite:///./thesis_db.sqlite3

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Security
JWT_SECRET_KEY=your-secret-key
```

## Getting Help

- **Documentation**: Check [docs/](docs/) directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers at dev@thesis-supervisor.com

## Recognition

Contributors are recognized in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file and in release notes.

Thank you for contributing to the Thesis Supervisor System! 🎉 