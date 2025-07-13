# Git Workflow

This document describes the Git workflow used in the Thesis Supervisor System project.

## Overview

We follow **GitHub Flow** with some adaptations for our team. This workflow is simple, predictable, and allows for continuous deployment.

## Branch Strategy

### Main Branches

- **main**: Production-ready code
  - All code in main is deployable
  - Direct pushes are not allowed
  - Only accepts merges from feature branches via pull requests

### Feature Branches

- **feature/[issue-number]-[short-description]**: Feature development
  - Example: `feature/123-user-authentication`
  - Created from main branch
  - Merged back to main via pull request

- **bugfix/[issue-number]-[short-description]**: Bug fixes
  - Example: `bugfix/456-login-validation`
  - Created from main branch
  - Merged back to main via pull request

- **hotfix/[issue-number]-[short-description]**: Critical production fixes
  - Example: `hotfix/789-security-vulnerability`
  - Created from main branch
  - Merged back to main via pull request with expedited review

## Workflow Process

### 1. Issue Creation

Before starting work, create an issue that describes:
- What needs to be done
- Acceptance criteria
- Any relevant context or requirements

### 2. Branch Creation

```bash
# Switch to main and pull latest changes
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/123-user-authentication
```

### 3. Development

```bash
# Make your changes
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat(auth): implement user authentication"

# Push to remote
git push origin feature/123-user-authentication
```

### 4. Pull Request

1. Create pull request from feature branch to main
2. Fill out PR template with:
   - Description of changes
   - Link to related issue
   - Testing information
   - Screenshots (if applicable)

### 5. Code Review

- At least one approval required
- Address all feedback before merging
- Ensure all CI checks pass

### 6. Merge

- Use squash merge to main
- Delete feature branch after merge
- Deploy to production (if applicable)

## Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, build changes, etc.

### Scope

Optional scope that provides context:
- **auth**: Authentication related
- **database**: Database operations
- **api**: API endpoints
- **frontend**: Frontend components
- **telegram**: Telegram bot functionality

### Examples

```bash
# Feature commits
git commit -m "feat(auth): add user registration endpoint"
git commit -m "feat(frontend): implement student dashboard"

# Bug fix commits
git commit -m "fix(database): resolve connection timeout issues"
git commit -m "fix(telegram): handle webhook errors gracefully"

# Documentation commits
git commit -m "docs(readme): update installation instructions"
git commit -m "docs(api): add endpoint documentation"

# Other commits
git commit -m "test(auth): add unit tests for login functionality"
git commit -m "chore(deps): update dependencies to latest versions"
```

## Branch Naming Conventions

### Pattern

```
type/issue-number-short-description
```

### Examples

```bash
# Features
feature/123-user-registration
feature/456-student-dashboard
feature/789-telegram-notifications

# Bug fixes
bugfix/321-login-validation
bugfix/654-database-connection
bugfix/987-frontend-rendering

# Hotfixes
hotfix/111-security-patch
hotfix/222-critical-bug-fix
```

## Pull Request Process

### PR Requirements

1. **Issue Reference**: Must reference an existing issue
2. **Description**: Clear description of changes
3. **Testing**: All tests must pass
4. **Review**: At least one approval required
5. **CI**: All continuous integration checks must pass

### PR Template

```markdown
## Description
Brief description of changes made.

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] End-to-end tests

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Guidelines

#### For Authors

- Keep PRs small and focused
- Provide clear description and context
- Respond to feedback promptly
- Update documentation when needed
- Ensure all tests pass

#### For Reviewers

- Review for functionality, performance, and security
- Provide constructive feedback
- Check test coverage
- Verify documentation updates
- Approve only when confident in changes

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Release Steps

1. **Prepare Release**
   ```bash
   # Create release branch
   git checkout -b release/v1.2.0
   
   # Update version numbers
   # Update CHANGELOG.md
   # Run final tests
   ```

2. **Create Release PR**
   - Review all changes since last release
   - Ensure CHANGELOG.md is updated
   - Verify version numbers are correct

3. **Merge and Tag**
   ```bash
   # Merge release branch
   git checkout main
   git merge release/v1.2.0
   
   # Create tag
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

4. **Deploy**
   - Deploy to production
   - Monitor for issues
   - Create GitHub release with changelog

## Best Practices

### Branch Management

- Keep branches small and focused
- Delete merged branches promptly
- Use descriptive branch names
- Regularly sync with main branch

### Commit Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages
- Commit early and often
- Use conventional commit format

### Collaboration

- Communicate changes that affect others
- Review code thoroughly
- Provide helpful feedback
- Keep PRs manageable in size

## Troubleshooting

### Common Issues

#### Merge Conflicts

```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/your-branch
git rebase main

# Resolve conflicts manually
# Add resolved files
git add .
git rebase --continue
```

#### Accidentally Committed to Main

```bash
# Create new branch from current state
git checkout -b feature/emergency-branch

# Reset main to origin
git checkout main
git reset --hard origin/main

# Continue work on feature branch
git checkout feature/emergency-branch
```

#### Need to Change Last Commit Message

```bash
# If commit hasn't been pushed
git commit --amend -m "New commit message"

# If commit has been pushed (force push required)
git commit --amend -m "New commit message"
git push --force-with-lease origin your-branch
```

## Git Hooks

We use pre-commit hooks to ensure code quality:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

### Hook Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-yaml

  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8
```

## Resources

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Pre-commit Hooks](https://pre-commit.com/) 