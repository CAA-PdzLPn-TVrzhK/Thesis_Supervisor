# Continuous Integration

This document describes the continuous integration (CI) setup, processes, and best practices for the Thesis Supervisor System.

## Overview

Our CI/CD pipeline is built on GitHub Actions and provides automated testing, code quality checks, security scanning, and deployment automation. The pipeline ensures code quality and enables rapid, reliable deployments.

## Pipeline Architecture

```
    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
    │   Code      │    │   GitHub     │    │   Build &   │
    │   Push      │───▶│   Actions    │───▶│   Test      │
    │             │    │   Trigger    │    │             │
    └─────────────┘    └──────────────┘    └─────────────┘
                                                  │
                                                  ▼
    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
    │   Deploy    │    │   Security   │    │   Quality   │
    │   to Prod   │◀───│   Scanning   │◀───│   Gates     │
    │             │    │              │    │             │
    └─────────────┘    └──────────────┘    └─────────────┘
```

## GitHub Actions Workflows

### Main CI Pipeline

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  PYTHON_VERSION: '3.9'
  NODE_VERSION: '16'

jobs:
  # Code Quality Checks
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 black isort mypy
        pip install -r requirements.txt
    
    - name: Run flake8
      run: |
        flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 app/ --count --exit-zero --max-complexity=10 --max-line-length=88 --statistics
    
    - name: Check code formatting with black
      run: |
        black --check app/
    
    - name: Check import sorting with isort
      run: |
        isort --check-only app/
    
    - name: Run type checking with mypy
      run: |
        mypy app/
    
    - name: Frontend code quality
      run: |
        cd app/front
        npm install
        npm run lint
        npm run format:check

  # Security Scanning
  security:
    name: Security Scanning
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install bandit safety
        pip install -r requirements.txt
    
    - name: Run Bandit security scan
      run: |
        bandit -r app/ -f json -o bandit-report.json
    
    - name: Check for known vulnerabilities
      run: |
        safety check --json --output safety-report.json
    
    - name: Upload security reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: |
          bandit-report.json
          safety-report.json
    
    - name: Frontend security audit
      run: |
        cd app/front
        npm install
        npm audit --audit-level=moderate

  # Backend Tests
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run unit tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: |
        pytest app/Tests/unit/ -v --cov=app --cov-report=xml --cov-report=term-missing
    
    - name: Run integration tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: |
        pytest app/Tests/integration/ -v
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: backend
        name: backend-coverage

  # Frontend Tests
  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: app/front/package-lock.json
    
    - name: Install dependencies
      run: |
        cd app/front
        npm ci
    
    - name: Run tests
      run: |
        cd app/front
        npm test -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./app/front/coverage/lcov.info
        flags: frontend
        name: frontend-coverage
    
    - name: Upload test artifacts
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: frontend-test-results
        path: app/front/coverage/

  # End-to-End Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: app/front/package-lock.json
    
    - name: Install backend dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Install frontend dependencies
      run: |
        cd app/front
        npm ci
        npx playwright install
    
    - name: Start application
      run: |
        # Start backend
        python app/main.py &
        echo $! > backend.pid
        
        # Start frontend
        cd app/front
        npm start &
        echo $! > frontend.pid
        
        # Wait for services to start
        sleep 30
    
    - name: Run E2E tests
      run: |
        cd app/front
        npx playwright test
    
    - name: Stop application
      if: always()
      run: |
        kill $(cat backend.pid) || true
        kill $(cat app/front/frontend.pid) || true
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: e2e-test-results
        path: |
          app/front/playwright-report/
          app/front/test-results/

  # Build Application
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [code-quality, security, backend-tests, frontend-tests]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: app/front/package-lock.json
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        cd app/front
        npm ci
    
    - name: Build frontend
      run: |
        cd app/front
        npm run build
    
    - name: Build Docker image
      run: |
        docker build -t thesis-supervisor:${{ github.sha }} .
    
    - name: Save Docker image
      run: |
        docker save thesis-supervisor:${{ github.sha }} | gzip > thesis-supervisor.tar.gz
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-artifacts
        path: |
          thesis-supervisor.tar.gz
          app/front/dist/

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-artifacts
    
    - name: Deploy to staging
      env:
        STAGING_HOST: ${{ secrets.STAGING_HOST }}
        STAGING_USER: ${{ secrets.STAGING_USER }}
        STAGING_KEY: ${{ secrets.STAGING_PRIVATE_KEY }}
      run: |
        # Deploy to staging server
        echo "Deploying to staging environment..."
        # Add actual deployment commands here
    
    - name: Run smoke tests
      run: |
        # Run basic smoke tests against staging
        curl -f https://staging.thesis-supervisor.com/health || exit 1
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-artifacts
    
    - name: Deploy to production
      env:
        PROD_HOST: ${{ secrets.PROD_HOST }}
        PROD_USER: ${{ secrets.PROD_USER }}
        PROD_KEY: ${{ secrets.PROD_PRIVATE_KEY }}
      run: |
        # Deploy to production server
        echo "Deploying to production environment..."
        # Add actual deployment commands here
    
    - name: Run health checks
      run: |
        # Verify production deployment
        curl -f https://thesis-supervisor.com/health || exit 1
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Pull Request Workflow

```yaml
# .github/workflows/pr.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  pr-checks:
    name: PR Quality Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Check PR title format
      run: |
        PR_TITLE="${{ github.event.pull_request.title }}"
        if ! echo "$PR_TITLE" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
          echo "PR title must follow conventional commits format"
          exit 1
        fi
    
    - name: Check for breaking changes
      run: |
        # Check if PR contains breaking changes
        if git diff --name-only origin/main...HEAD | grep -q "app/Infrastructure/DataBase/Models/"; then
          echo "::warning::PR contains database model changes - review for breaking changes"
        fi
    
    - name: Run danger
      uses: danger/danger-js@9.1.8
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Generate changelog
      id: changelog
      run: |
        # Generate changelog from git log
        git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 HEAD^)..HEAD > CHANGELOG.md
    
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body_path: CHANGELOG.md
        draft: false
        prerelease: false
    
    - name: Build and push Docker image
      run: |
        docker build -t thesis-supervisor:${{ github.ref_name }} .
        docker tag thesis-supervisor:${{ github.ref_name }} thesis-supervisor:latest
        # Push to container registry
```

## Quality Gates

### Code Quality Metrics

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gates:
    name: Quality Gates
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run tests with coverage
      run: |
        pytest --cov=app --cov-report=xml --cov-report=term-missing
    
    - name: Check coverage threshold
      run: |
        coverage report --fail-under=85
    
    - name: Run complexity analysis
      run: |
        radon cc app/ --min=C
    
    - name: Check code duplication
      run: |
        jscpd app/ --threshold=10
    
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install locust
    
    - name: Start application
      run: |
        python app/main.py &
        sleep 10
    
    - name: Run load tests
      run: |
        locust -f tests/performance/locustfile.py --headless -u 50 -r 5 -t 60s --host=http://localhost:8000
    
    - name: Upload performance results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: locust-report.html
```

## Branch Protection Rules

### Main Branch Protection

```yaml
# Branch protection configuration (applied via GitHub settings)
protection_rules:
  main:
    required_status_checks:
      strict: true
      contexts:
        - "Code Quality"
        - "Security Scanning"
        - "Backend Tests"
        - "Frontend Tests"
        - "E2E Tests"
    
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    
    restrictions:
      users: []
      teams: ["core-team"]
    
    allow_force_pushes: false
    allow_deletions: false
```

### Develop Branch Protection

```yaml
protection_rules:
  develop:
    required_status_checks:
      strict: true
      contexts:
        - "Code Quality"
        - "Backend Tests"
        - "Frontend Tests"
    
    enforce_admins: false
    required_pull_request_reviews:
      required_approving_review_count: 1
      dismiss_stale_reviews: true
    
    allow_force_pushes: false
    allow_deletions: false
```

## Environment Management

### Environment Variables

```yaml
# Environment-specific secrets and variables
environments:
  staging:
    variables:
      NODE_ENV: staging
      API_URL: https://api-staging.thesis-supervisor.com
      FRONTEND_URL: https://staging.thesis-supervisor.com
    
    secrets:
      DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      JWT_SECRET_KEY: ${{ secrets.STAGING_JWT_SECRET }}
      TELEGRAM_BOT_TOKEN: ${{ secrets.STAGING_TELEGRAM_TOKEN }}
  
  production:
    variables:
      NODE_ENV: production
      API_URL: https://api.thesis-supervisor.com
      FRONTEND_URL: https://thesis-supervisor.com
    
    secrets:
      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
      JWT_SECRET_KEY: ${{ secrets.PROD_JWT_SECRET }}
      TELEGRAM_BOT_TOKEN: ${{ secrets.PROD_TELEGRAM_TOKEN }}
```

### Deployment Strategies

#### Blue-Green Deployment

```bash
#!/bin/bash
# scripts/deploy-blue-green.sh

set -e

ENVIRONMENT=$1
NEW_VERSION=$2
CURRENT_COLOR=$(curl -s "$ENVIRONMENT/health" | jq -r '.color')

if [ "$CURRENT_COLOR" = "blue" ]; then
    TARGET_COLOR="green"
else
    TARGET_COLOR="blue"
fi

echo "Deploying version $NEW_VERSION to $TARGET_COLOR environment"

# Deploy to target environment
docker-compose -f docker-compose.$TARGET_COLOR.yml up -d

# Wait for health checks
echo "Waiting for health checks..."
sleep 30

# Verify deployment
if curl -f "$ENVIRONMENT-$TARGET_COLOR/health"; then
    echo "Health check passed, switching traffic"
    
    # Switch load balancer
    kubectl patch service app-service -p '{"spec":{"selector":{"color":"'$TARGET_COLOR'"}}}'
    
    echo "Deployment successful"
else
    echo "Health check failed, rolling back"
    docker-compose -f docker-compose.$TARGET_COLOR.yml down
    exit 1
fi
```

#### Canary Deployment

```bash
#!/bin/bash
# scripts/deploy-canary.sh

set -e

ENVIRONMENT=$1
NEW_VERSION=$2
CANARY_PERCENTAGE=${3:-10}

echo "Starting canary deployment for version $NEW_VERSION"

# Deploy canary version
kubectl apply -f k8s/canary-deployment.yaml

# Configure traffic split
kubectl patch virtualservice app-vs -p '{"spec":{"http":[{"match":[{"headers":{"canary":{"exact":"true"}}}],"route":[{"destination":{"host":"app-canary","subset":"v'$NEW_VERSION'"}}]},{"route":[{"destination":{"host":"app-stable","weight":'$((100-CANARY_PERCENTAGE))'}},{"destination":{"host":"app-canary","weight":'$CANARY_PERCENTAGE'}}]}]}}'

echo "Canary deployment started with $CANARY_PERCENTAGE% traffic"

# Monitor metrics
echo "Monitoring metrics for 10 minutes..."
sleep 600

# Check error rates
ERROR_RATE=$(curl -s "$MONITORING_URL/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" | jq -r '.data.result[0].value[1]')

if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "Error rate too high, rolling back"
    kubectl delete -f k8s/canary-deployment.yaml
    exit 1
else
    echo "Metrics look good, promoting canary"
    kubectl apply -f k8s/production-deployment.yaml
fi
```

## Monitoring and Alerting

### Pipeline Monitoring

```yaml
# .github/workflows/monitoring.yml
name: Pipeline Monitoring

on:
  workflow_run:
    workflows: ["Continuous Integration"]
    types: [completed]

jobs:
  monitor:
    name: Monitor Pipeline
    runs-on: ubuntu-latest
    
    steps:
    - name: Check pipeline status
      run: |
        if [ "${{ github.event.workflow_run.conclusion }}" = "failure" ]; then
          echo "Pipeline failed, sending alert"
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-type: application/json' \
            --data '{"text":"🚨 CI Pipeline failed for commit ${{ github.event.workflow_run.head_sha }}"}'
        fi
    
    - name: Update pipeline metrics
      run: |
        # Send metrics to monitoring system
        curl -X POST "${{ secrets.METRICS_ENDPOINT }}" \
          -H 'Content-type: application/json' \
          --data '{
            "metric": "pipeline_duration",
            "value": ${{ github.event.workflow_run.duration }},
            "tags": {
              "status": "${{ github.event.workflow_run.conclusion }}",
              "branch": "${{ github.event.workflow_run.head_branch }}"
            }
          }'
```

### Build Metrics Dashboard

```javascript
// monitoring/dashboard.js
const buildMetrics = {
  pipelineDuration: {
    query: 'avg(pipeline_duration_seconds)',
    threshold: 600, // 10 minutes
    alert: 'Pipeline duration exceeds threshold'
  },
  
  testCoverage: {
    query: 'avg(test_coverage_percentage)',
    threshold: 85,
    alert: 'Test coverage below threshold'
  },
  
  deploymentFrequency: {
    query: 'rate(deployments_total[7d])',
    threshold: 1,
    alert: 'Deployment frequency too low'
  },
  
  failureRate: {
    query: 'rate(pipeline_failures_total[7d])',
    threshold: 0.1,
    alert: 'Pipeline failure rate too high'
  }
};
```

## Troubleshooting

### Common Issues

#### Test Failures

```bash
# Debug test failures
pytest -v --tb=short --no-header
pytest --lf  # Run last failed tests
pytest --pdb  # Drop into debugger on failure
```

#### Build Failures

```bash
# Check build logs
docker build --no-cache -t thesis-supervisor .
docker run --rm thesis-supervisor /bin/bash -c "python -m pytest"
```

#### Deployment Issues

```bash
# Check deployment status
kubectl get pods -l app=thesis-supervisor
kubectl logs -l app=thesis-supervisor --tail=100
kubectl describe deployment thesis-supervisor
```

### Pipeline Debugging

```yaml
# Debug workflow with increased logging
- name: Debug step
  run: |
    set -x  # Enable debug mode
    echo "Current directory: $(pwd)"
    echo "Environment variables:"
    env | sort
    echo "Running processes:"
    ps aux
```

## Best Practices

### Pipeline Design

1. **Fail Fast**: Run quick checks first
2. **Parallel Execution**: Run independent jobs in parallel
3. **Caching**: Cache dependencies to speed up builds
4. **Minimal Rebuild**: Only rebuild what changed
5. **Clear Feedback**: Provide actionable error messages

### Security

1. **Secret Management**: Use GitHub Secrets for sensitive data
2. **Least Privilege**: Limit permissions for CI/CD processes
3. **Audit Logs**: Monitor all CI/CD activities
4. **Dependency Scanning**: Regularly scan for vulnerabilities
5. **Image Security**: Scan Docker images for vulnerabilities

### Performance

1. **Optimize Docker Images**: Use multi-stage builds
2. **Parallel Testing**: Run tests in parallel
3. **Selective Testing**: Run relevant tests based on changes
4. **Resource Limits**: Set appropriate resource limits
5. **Monitoring**: Track pipeline performance metrics

## Metrics and KPIs

### Key Metrics

- **Build Success Rate**: > 95%
- **Average Build Time**: < 10 minutes
- **Test Coverage**: > 85%
- **Deployment Frequency**: > 1 per day
- **Lead Time**: < 2 hours
- **Mean Time to Recovery**: < 1 hour

### Reporting

```sql
-- Pipeline metrics query
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_builds,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_builds,
  AVG(duration_seconds) as avg_duration,
  AVG(test_coverage_percentage) as avg_coverage
FROM ci_builds 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI/CD Best Practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Monitoring CI/CD Pipelines](https://prometheus.io/docs/practices/instrumentation/) 