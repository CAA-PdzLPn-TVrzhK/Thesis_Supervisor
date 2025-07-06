# Development Documentation

This directory contains development process documentation for the Thesis Supervisor System.

## Files

- **`git-workflow.mmd`** - Mermaid diagram illustrating our Git workflow process

## Development Process

### Git Workflow
We follow a **GitHub Flow** adapted for our academic project:

#### Key Principles
- `main` branch is always deployable
- Feature branches for all new work
- Pull requests for code review
- Continuous integration on all branches

#### Branch Naming Convention
- `feature/[issue-number]-[short-description]`
- `bugfix/[issue-number]-[short-description]`
- `hotfix/[issue-number]-[short-description]`

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Code Review Process
1. Create pull request with descriptive title
2. Fill out PR template completely
3. Assign at least one reviewer
4. Address all feedback
5. Ensure CI passes
6. Squash merge to main

### Quality Gates
- [ ] All tests pass
- [ ] Code coverage maintained
- [ ] Linting rules satisfied
- [ ] Documentation updated
- [ ] Security checks pass

## Tools and Setup

### Required Tools
- Python 3.8+
- Git
- Code editor (VS Code recommended)
- PlantUML (for diagrams)
- Mermaid CLI (for git workflow diagram)

### Development Environment
```bash
# Clone repository
git clone [repository-url]
cd thesis_supervisor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python app/Infrastructure/DataBase/init_db.py

# Run tests
pytest

# Start development server
python app/main.py
``` 