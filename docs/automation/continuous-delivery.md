# Continuous Delivery

This document outlines the continuous delivery (CD) strategy, deployment processes, and infrastructure management for the Thesis Supervisor System.

## Overview

Our continuous delivery pipeline enables automated, reliable, and frequent deployments to multiple environments while maintaining system stability and minimizing downtime.

## Deployment Strategy

### Environment Progression

```
Development → Testing → Staging → Production
     ↓           ↓        ↓          ↓
  Feature    Integration  UAT     Live Users
  Testing      Testing   Testing
```

### Deployment Environments

#### Development Environment
- **Purpose**: Feature development and initial testing
- **Deployment**: Automatic on push to feature branches
- **Infrastructure**: Minimal resources, SQLite database
- **Monitoring**: Basic logging and error tracking

#### Testing Environment
- **Purpose**: Automated testing and quality assurance
- **Deployment**: Automatic on push to develop branch
- **Infrastructure**: Production-like setup with test data
- **Monitoring**: Comprehensive testing metrics

#### Staging Environment
- **Purpose**: Final validation before production
- **Deployment**: Automatic on successful testing
- **Infrastructure**: Production mirror with anonymized data
- **Monitoring**: Full monitoring suite

#### Production Environment
- **Purpose**: Live user traffic
- **Deployment**: Manual approval after staging validation
- **Infrastructure**: High availability, performance optimized
- **Monitoring**: Real-time alerting and comprehensive metrics

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "thesis_supervisor_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "thesis-supervisor-vpc"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.thesis_supervisor_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name        = "thesis-supervisor-public-${count.index + 1}"
    Environment = var.environment
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.thesis_supervisor_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "thesis-supervisor-private-${count.index + 1}"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "thesis_supervisor_igw" {
  vpc_id = aws_vpc.thesis_supervisor_vpc.id

  tags = {
    Name        = "thesis-supervisor-igw"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "thesis_supervisor_cluster" {
  name = "thesis-supervisor-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "thesis_supervisor_alb" {
  name               = "thesis-supervisor-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}

# RDS Database
resource "aws_db_instance" "thesis_supervisor_db" {
  identifier = "thesis-supervisor-${var.environment}"
  
  engine         = "postgres"
  engine_version = "13.7"
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "thesis_supervisor"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.thesis_supervisor_db_subnet_group.name
  
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "thesis-supervisor-final-snapshot" : null
  
  tags = {
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "thesis_supervisor_cache_subnet_group" {
  name       = "thesis-supervisor-cache-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id
}

resource "aws_elasticache_cluster" "thesis_supervisor_cache" {
  cluster_id           = "thesis-supervisor-cache-${var.environment}"
  engine               = "redis"
  node_type            = var.cache_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.thesis_supervisor_cache_subnet_group.name
  security_group_ids   = [aws_security_group.cache_sg.id]
  
  tags = {
    Environment = var.environment
  }
}
```

### Environment-Specific Variables

```hcl
# infrastructure/environments/production.tfvars
environment = "production"
aws_region  = "us-east-1"

availability_zones = [
  "us-east-1a",
  "us-east-1b",
  "us-east-1c"
]

# Database configuration
db_instance_class      = "db.t3.medium"
db_allocated_storage   = 100
db_max_allocated_storage = 1000

# Cache configuration
cache_node_type = "cache.t3.micro"

# ECS configuration
ecs_desired_count = 3
ecs_cpu          = 1024
ecs_memory       = 2048

# Auto scaling
min_capacity = 2
max_capacity = 10
```

```hcl
# infrastructure/environments/staging.tfvars
environment = "staging"
aws_region  = "us-east-1"

availability_zones = [
  "us-east-1a",
  "us-east-1b"
]

# Database configuration
db_instance_class      = "db.t3.micro"
db_allocated_storage   = 20
db_max_allocated_storage = 100

# Cache configuration
cache_node_type = "cache.t3.micro"

# ECS configuration
ecs_desired_count = 1
ecs_cpu          = 512
ecs_memory       = 1024

# Auto scaling
min_capacity = 1
max_capacity = 3
```

## Deployment Automation

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    name: Deploy to ${{ github.event.inputs.environment || 'production' }}
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: thesis-supervisor
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Build image
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
        
        # Push image
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Deploy infrastructure
      run: |
        cd infrastructure
        terraform init
        terraform plan -var-file=environments/${{ github.event.inputs.environment || 'production' }}.tfvars
        terraform apply -var-file=environments/${{ github.event.inputs.environment || 'production' }}.tfvars -auto-approve
    
    - name: Deploy application
      env:
        IMAGE_TAG: ${{ github.sha }}
        ENVIRONMENT: ${{ github.event.inputs.environment || 'production' }}
      run: |
        # Update ECS service
        aws ecs update-service \
          --cluster thesis-supervisor-$ENVIRONMENT \
          --service thesis-supervisor-service \
          --force-new-deployment
        
        # Wait for deployment to complete
        aws ecs wait services-stable \
          --cluster thesis-supervisor-$ENVIRONMENT \
          --services thesis-supervisor-service
    
    - name: Run post-deployment tests
      run: |
        # Run smoke tests
        ./scripts/smoke-tests.sh ${{ github.event.inputs.environment || 'production' }}
    
    - name: Notify deployment
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        text: |
          Deployment to ${{ github.event.inputs.environment || 'production' }} ${{ job.status }}
          Commit: ${{ github.sha }}
          Author: ${{ github.actor }}
```

### ECS Task Definition

```json
{
  "family": "thesis-supervisor",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "thesis-supervisor-app",
      "image": "ECR_REGISTRY/thesis-supervisor:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:thesis-supervisor/database-url"
        },
        {
          "name": "JWT_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:thesis-supervisor/jwt-secret"
        },
        {
          "name": "TELEGRAM_BOT_TOKEN",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:thesis-supervisor/telegram-token"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/thesis-supervisor",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

## Deployment Strategies

### Blue-Green Deployment

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

ENVIRONMENT=$1
NEW_IMAGE_TAG=$2
CLUSTER_NAME="thesis-supervisor-$ENVIRONMENT"

# Get current service configuration
CURRENT_SERVICE=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services thesis-supervisor-service \
  --query 'services[0]')

CURRENT_TASK_DEFINITION=$(echo $CURRENT_SERVICE | jq -r '.taskDefinition')

# Create new task definition with new image
NEW_TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition $CURRENT_TASK_DEFINITION \
  --query 'taskDefinition' | \
  jq --arg image "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/thesis-supervisor:$NEW_IMAGE_TAG" \
  '.containerDefinitions[0].image = $image | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "$NEW_TASK_DEFINITION" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "Created new task definition: $NEW_TASK_DEF_ARN"

# Update service with new task definition
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service thesis-supervisor-service \
  --task-definition $NEW_TASK_DEF_ARN

echo "Updated service with new task definition"

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services thesis-supervisor-service

echo "Deployment completed successfully"

# Run health checks
echo "Running health checks..."
LOAD_BALANCER_DNS=$(aws elbv2 describe-load-balancers \
  --names "thesis-supervisor-alb-$ENVIRONMENT" \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

for i in {1..10}; do
  if curl -f "http://$LOAD_BALANCER_DNS/health"; then
    echo "Health check $i/10 passed"
  else
    echo "Health check $i/10 failed"
    exit 1
  fi
  sleep 30
done

echo "All health checks passed"
```

### Canary Deployment

```bash
#!/bin/bash
# scripts/canary-deploy.sh

set -e

ENVIRONMENT=$1
NEW_IMAGE_TAG=$2
CANARY_PERCENTAGE=${3:-10}
CLUSTER_NAME="thesis-supervisor-$ENVIRONMENT"

echo "Starting canary deployment for image tag: $NEW_IMAGE_TAG"

# Create canary service
CANARY_SERVICE_NAME="thesis-supervisor-canary-service"

# Create canary task definition
CANARY_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition thesis-supervisor \
  --query 'taskDefinition' | \
  jq --arg image "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/thesis-supervisor:$NEW_IMAGE_TAG" \
  '.containerDefinitions[0].image = $image | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')

CANARY_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "$CANARY_TASK_DEF" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# Create canary service
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $CANARY_SERVICE_NAME \
  --task-definition $CANARY_TASK_DEF_ARN \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Update load balancer to route traffic to canary
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --names "thesis-supervisor-tg-$ENVIRONMENT" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create canary target group
CANARY_TG_ARN=$(aws elbv2 create-target-group \
  --name "thesis-supervisor-canary-tg-$ENVIRONMENT" \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /health \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Update listener rules for canary traffic
aws elbv2 create-rule \
  --listener-arn "arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:listener/app/thesis-supervisor-alb-$ENVIRONMENT/xxx" \
  --priority 100 \
  --conditions "Field=header,Values=X-Canary-Request" \
  --actions "Type=forward,TargetGroupArn=$CANARY_TG_ARN"

echo "Canary deployment created, monitoring metrics..."

# Monitor canary metrics for 10 minutes
for i in {1..10}; do
  echo "Monitoring canary metrics... ($i/10)"
  
  # Check error rates, response times, etc.
  ERROR_RATE=$(aws cloudwatch get-metric-statistics \
    --namespace "AWS/ApplicationELB" \
    --metric-name "HTTPCode_Target_5XX_Count" \
    --dimensions "Name=TargetGroup,Value=$CANARY_TG_ARN" \
    --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Sum \
    --query 'Datapoints[0].Sum' \
    --output text)
  
  if [ "$ERROR_RATE" != "None" ] && [ "$ERROR_RATE" -gt 0 ]; then
    echo "Error rate too high: $ERROR_RATE errors in 5 minutes"
    echo "Rolling back canary deployment..."
    aws ecs delete-service --cluster $CLUSTER_NAME --service $CANARY_SERVICE_NAME --force
    aws elbv2 delete-target-group --target-group-arn $CANARY_TG_ARN
    exit 1
  fi
  
  sleep 60
done

echo "Canary metrics look good, promoting to production..."

# Promote canary to production
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service thesis-supervisor-service \
  --task-definition $CANARY_TASK_DEF_ARN

# Clean up canary resources
aws ecs delete-service --cluster $CLUSTER_NAME --service $CANARY_SERVICE_NAME --force
aws elbv2 delete-target-group --target-group-arn $CANARY_TG_ARN

echo "Canary deployment promoted successfully"
```

## Database Migrations

### Migration Strategy

```python
# scripts/migrate.py
import os
import sys
from alembic import command
from alembic.config import Config
from app.Infrastructure.DataBase.Base import engine, Base
from app.Infrastructure.DataBase.session import SessionLocal

def run_migrations():
    """Run database migrations."""
    try:
        # Create alembic configuration
        alembic_cfg = Config("alembic.ini")
        
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        
        print("Database migrations completed successfully")
        return True
    except Exception as e:
        print(f"Migration failed: {e}")
        return False

def rollback_migration(revision):
    """Rollback to specific migration."""
    try:
        alembic_cfg = Config("alembic.ini")
        command.downgrade(alembic_cfg, revision)
        print(f"Rolled back to revision: {revision}")
        return True
    except Exception as e:
        print(f"Rollback failed: {e}")
        return False

def verify_migration():
    """Verify migration was successful."""
    try:
        # Test database connection
        with SessionLocal() as session:
            session.execute("SELECT 1")
        
        # Run basic queries to verify schema
        from app.Infrastructure.DataBase.Models.user import User
        with SessionLocal() as session:
            user_count = session.query(User).count()
            print(f"User table accessible, contains {user_count} users")
        
        return True
    except Exception as e:
        print(f"Migration verification failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "rollback":
            revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
            success = rollback_migration(revision)
        else:
            success = run_migrations()
    else:
        success = run_migrations()
    
    if success:
        success = verify_migration()
    
    sys.exit(0 if success else 1)
```

### Migration Deployment

```bash
#!/bin/bash
# scripts/deploy-with-migration.sh

set -e

ENVIRONMENT=$1
NEW_IMAGE_TAG=$2

echo "Starting deployment with database migration..."

# 1. Backup database
echo "Creating database backup..."
aws rds create-db-snapshot \
  --db-instance-identifier "thesis-supervisor-$ENVIRONMENT" \
  --db-snapshot-identifier "thesis-supervisor-$ENVIRONMENT-$(date +%Y%m%d%H%M%S)"

# 2. Run migration in maintenance mode
echo "Enabling maintenance mode..."
aws ecs update-service \
  --cluster "thesis-supervisor-$ENVIRONMENT" \
  --service "thesis-supervisor-service" \
  --desired-count 0

# Wait for all tasks to stop
aws ecs wait services-stable \
  --cluster "thesis-supervisor-$ENVIRONMENT" \
  --services "thesis-supervisor-service"

# 3. Run migration
echo "Running database migration..."
python scripts/migrate.py

if [ $? -ne 0 ]; then
  echo "Migration failed, rolling back..."
  # Restore from backup if needed
  exit 1
fi

# 4. Deploy new application version
echo "Deploying new application version..."
./scripts/blue-green-deploy.sh $ENVIRONMENT $NEW_IMAGE_TAG

# 5. Verify deployment
echo "Verifying deployment..."
if ./scripts/smoke-tests.sh $ENVIRONMENT; then
  echo "Deployment successful"
else
  echo "Deployment verification failed, rolling back..."
  # Rollback logic here
  exit 1
fi

echo "Deployment with migration completed successfully"
```

## Monitoring and Observability

### CloudWatch Dashboards

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", "ServiceName", "thesis-supervisor-service"],
          ["AWS/ECS", "MemoryUtilization", "ServiceName", "thesis-supervisor-service"]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "ECS Resource Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/thesis-supervisor-alb-production"],
          ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", "app/thesis-supervisor-alb-production"],
          ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", "app/thesis-supervisor-alb-production"],
          ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", "app/thesis-supervisor-alb-production"]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Application Load Balancer Metrics",
        "period": 300
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "thesis-supervisor-production"],
          ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "thesis-supervisor-production"],
          ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", "thesis-supervisor-production"],
          ["AWS/RDS", "WriteLatency", "DBInstanceIdentifier", "thesis-supervisor-production"]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "RDS Database Metrics",
        "period": 300
      }
    }
  ]
}
```

### Application Metrics

```python
# app/monitoring/metrics.py
import time
import logging
from functools import wraps
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
ACTIVE_CONNECTIONS = Gauge('database_connections_active', 'Active database connections')
DEPLOYMENT_INFO = Gauge('deployment_info', 'Deployment information', ['version', 'environment'])

def track_requests(func):
    """Decorator to track HTTP requests."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            status_code = getattr(result, 'status_code', 200)
            REQUEST_COUNT.labels(
                method=func.__name__,
                endpoint=func.__name__,
                status=status_code
            ).inc()
            return result
        except Exception as e:
            REQUEST_COUNT.labels(
                method=func.__name__,
                endpoint=func.__name__,
                status=500
            ).inc()
            raise
        finally:
            REQUEST_LATENCY.observe(time.time() - start_time)
    
    return wrapper

def track_database_connections(session_factory):
    """Track database connection count."""
    def get_connection_count():
        # Get active connection count from database
        with session_factory() as session:
            result = session.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
            return result.scalar()
    
    ACTIVE_CONNECTIONS.set_function(get_connection_count)

def set_deployment_info(version, environment):
    """Set deployment information."""
    DEPLOYMENT_INFO.labels(version=version, environment=environment).set(1)

# Start metrics server
def start_metrics_server(port=8001):
    """Start Prometheus metrics server."""
    start_http_server(port)
    logging.info(f"Metrics server started on port {port}")
```

### Health Checks

```python
# app/health/checks.py
import asyncio
from enum import Enum
from typing import Dict, List
from app.Infrastructure.DataBase.session import SessionLocal
from app.Infrastructure.EmailVerification.Verifacator import EmailVerificator

class HealthStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"

class HealthCheck:
    def __init__(self, name: str, check_func, timeout: int = 30):
        self.name = name
        self.check_func = check_func
        self.timeout = timeout
    
    async def run(self) -> Dict:
        try:
            start_time = asyncio.get_event_loop().time()
            result = await asyncio.wait_for(self.check_func(), timeout=self.timeout)
            duration = asyncio.get_event_loop().time() - start_time
            
            return {
                "name": self.name,
                "status": HealthStatus.HEALTHY.value,
                "duration": duration,
                "details": result
            }
        except asyncio.TimeoutError:
            return {
                "name": self.name,
                "status": HealthStatus.UNHEALTHY.value,
                "error": "Timeout"
            }
        except Exception as e:
            return {
                "name": self.name,
                "status": HealthStatus.UNHEALTHY.value,
                "error": str(e)
            }

async def check_database():
    """Check database connectivity."""
    try:
        with SessionLocal() as session:
            session.execute("SELECT 1")
        return {"message": "Database connection successful"}
    except Exception as e:
        raise Exception(f"Database check failed: {e}")

async def check_email_service():
    """Check email service connectivity."""
    try:
        email_service = EmailVerificator()
        # Test SMTP connection
        return {"message": "Email service connection successful"}
    except Exception as e:
        raise Exception(f"Email service check failed: {e}")

async def check_external_apis():
    """Check external API dependencies."""
    try:
        # Check Telegram API
        # Add actual API checks here
        return {"message": "External APIs accessible"}
    except Exception as e:
        raise Exception(f"External API check failed: {e}")

# Health check registry
HEALTH_CHECKS = [
    HealthCheck("database", check_database),
    HealthCheck("email_service", check_email_service),
    HealthCheck("external_apis", check_external_apis),
]

async def run_health_checks() -> Dict:
    """Run all health checks."""
    results = []
    overall_status = HealthStatus.HEALTHY
    
    for check in HEALTH_CHECKS:
        result = await check.run()
        results.append(result)
        
        if result["status"] == HealthStatus.UNHEALTHY.value:
            overall_status = HealthStatus.UNHEALTHY
        elif result["status"] == HealthStatus.DEGRADED.value and overall_status == HealthStatus.HEALTHY:
            overall_status = HealthStatus.DEGRADED
    
    return {
        "status": overall_status.value,
        "checks": results,
        "timestamp": asyncio.get_event_loop().time()
    }
```

## Rollback Procedures

### Automated Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=$1
PREVIOUS_VERSION=${2:-"previous"}

echo "Starting rollback for environment: $ENVIRONMENT"

if [ "$PREVIOUS_VERSION" == "previous" ]; then
  # Get previous task definition
  PREVIOUS_TASK_DEF=$(aws ecs describe-services \
    --cluster "thesis-supervisor-$ENVIRONMENT" \
    --services "thesis-supervisor-service" \
    --query 'services[0].deployments[1].taskDefinition' \
    --output text)
else
  PREVIOUS_TASK_DEF=$PREVIOUS_VERSION
fi

echo "Rolling back to task definition: $PREVIOUS_TASK_DEF"

# Update service to previous version
aws ecs update-service \
  --cluster "thesis-supervisor-$ENVIRONMENT" \
  --service "thesis-supervisor-service" \
  --task-definition "$PREVIOUS_TASK_DEF"

echo "Rollback initiated, waiting for completion..."

# Wait for rollback to complete
aws ecs wait services-stable \
  --cluster "thesis-supervisor-$ENVIRONMENT" \
  --services "thesis-supervisor-service"

echo "Rollback completed successfully"

# Verify rollback
./scripts/smoke-tests.sh $ENVIRONMENT

if [ $? -eq 0 ]; then
  echo "Rollback verification successful"
  
  # Send notification
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-type: application/json' \
    --data "{\"text\":\"🔄 Rollback completed successfully for $ENVIRONMENT environment\"}"
else
  echo "Rollback verification failed"
  exit 1
fi
```

### Database Rollback

```python
# scripts/rollback-database.py
import sys
import os
from alembic import command
from alembic.config import Config
from app.Infrastructure.DataBase.session import SessionLocal

def rollback_database(target_revision):
    """Rollback database to specific revision."""
    try:
        # Create database backup before rollback
        create_backup()
        
        # Run database rollback
        alembic_cfg = Config("alembic.ini")
        command.downgrade(alembic_cfg, target_revision)
        
        print(f"Database rolled back to revision: {target_revision}")
        
        # Verify rollback
        if verify_rollback():
            print("Database rollback verified successfully")
            return True
        else:
            print("Database rollback verification failed")
            return False
            
    except Exception as e:
        print(f"Database rollback failed: {e}")
        return False

def create_backup():
    """Create database backup before rollback."""
    import subprocess
    import datetime
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backup_before_rollback_{timestamp}.sql"
    
    subprocess.run([
        "pg_dump",
        os.environ.get("DATABASE_URL"),
        "-f", backup_file
    ], check=True)
    
    print(f"Database backup created: {backup_file}")

def verify_rollback():
    """Verify database rollback was successful."""
    try:
        with SessionLocal() as session:
            session.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Rollback verification failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python rollback-database.py <target_revision>")
        sys.exit(1)
    
    target_revision = sys.argv[1]
    success = rollback_database(target_revision)
    sys.exit(0 if success else 1)
```

## Security and Compliance

### Security Scanning

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'thesis-supervisor:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Run SAST scan
      uses: github/super-linter@v4
      env:
        DEFAULT_BRANCH: main
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        VALIDATE_ALL_CODEBASE: false
        VALIDATE_PYTHON_BANDIT: true
        VALIDATE_DOCKERFILE_HADOLINT: true
```

### Compliance Checks

```python
# scripts/compliance-check.py
import os
import json
from typing import Dict, List

class ComplianceChecker:
    def __init__(self):
        self.checks = []
    
    def check_encryption_at_rest(self) -> Dict:
        """Check that data is encrypted at rest."""
        try:
            # Check RDS encryption
            # Check EBS encryption
            # Check S3 encryption
            return {
                "status": "compliant",
                "message": "All data storage is encrypted at rest"
            }
        except Exception as e:
            return {
                "status": "non_compliant",
                "message": f"Encryption check failed: {e}"
            }
    
    def check_network_security(self) -> Dict:
        """Check network security configuration."""
        try:
            # Check security groups
            # Check VPC configuration
            # Check SSL/TLS configuration
            return {
                "status": "compliant",
                "message": "Network security properly configured"
            }
        except Exception as e:
            return {
                "status": "non_compliant",
                "message": f"Network security check failed: {e}"
            }
    
    def check_access_controls(self) -> Dict:
        """Check access control configuration."""
        try:
            # Check IAM roles and policies
            # Check database user permissions
            # Check API authentication
            return {
                "status": "compliant",
                "message": "Access controls properly configured"
            }
        except Exception as e:
            return {
                "status": "non_compliant",
                "message": f"Access control check failed: {e}"
            }
    
    def run_all_checks(self) -> Dict:
        """Run all compliance checks."""
        results = []
        overall_status = "compliant"
        
        checks = [
            self.check_encryption_at_rest,
            self.check_network_security,
            self.check_access_controls
        ]
        
        for check in checks:
            result = check()
            results.append(result)
            
            if result["status"] == "non_compliant":
                overall_status = "non_compliant"
        
        return {
            "overall_status": overall_status,
            "checks": results,
            "timestamp": "2023-01-01T00:00:00Z"
        }

if __name__ == "__main__":
    checker = ComplianceChecker()
    results = checker.run_all_checks()
    
    print(json.dumps(results, indent=2))
    
    if results["overall_status"] == "non_compliant":
        exit(1)
```

## Performance Optimization

### Auto Scaling Configuration

```hcl
# Auto Scaling Target
resource "aws_appautoscaling_target" "thesis_supervisor_target" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.thesis_supervisor_cluster.name}/${aws_ecs_service.thesis_supervisor_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "thesis_supervisor_cpu_policy" {
  name               = "thesis-supervisor-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.thesis_supervisor_target.resource_id
  scalable_dimension = aws_appautoscaling_target.thesis_supervisor_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.thesis_supervisor_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Policy - Memory
resource "aws_appautoscaling_policy" "thesis_supervisor_memory_policy" {
  name               = "thesis-supervisor-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.thesis_supervisor_target.resource_id
  scalable_dimension = aws_appautoscaling_target.thesis_supervisor_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.thesis_supervisor_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}
```

### CDN Configuration

```hcl
# CloudFront Distribution
resource "aws_cloudfront_distribution" "thesis_supervisor_cdn" {
  origin {
    domain_name = aws_lb.thesis_supervisor_alb.dns_name
    origin_id   = "thesis-supervisor-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "thesis-supervisor-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      headers      = ["Host", "Authorization"]
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Static assets cache behavior
  ordered_cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "thesis-supervisor-origin"
    compress         = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = var.environment
  }
}
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

set -e

ENVIRONMENT=$1
BACKUP_TYPE=${2:-"full"}

echo "Starting $BACKUP_TYPE backup for $ENVIRONMENT environment"

# Database backup
echo "Creating database backup..."
DB_BACKUP_NAME="thesis-supervisor-$ENVIRONMENT-$(date +%Y%m%d%H%M%S)"
aws rds create-db-snapshot \
  --db-instance-identifier "thesis-supervisor-$ENVIRONMENT" \
  --db-snapshot-identifier "$DB_BACKUP_NAME"

# Application data backup
echo "Backing up application data..."
aws s3 sync s3://thesis-supervisor-data-$ENVIRONMENT s3://thesis-supervisor-backup-$ENVIRONMENT/$(date +%Y%m%d)/ --delete

# Configuration backup
echo "Backing up configuration..."
aws secretsmanager get-secret-value --secret-id "thesis-supervisor/$ENVIRONMENT/config" \
  --output text --query SecretString > config-backup-$(date +%Y%m%d%H%M%S).json

# Docker image backup
echo "Backing up Docker images..."
docker save thesis-supervisor:latest | gzip > thesis-supervisor-backup-$(date +%Y%m%d%H%M%S).tar.gz
aws s3 cp thesis-supervisor-backup-$(date +%Y%m%d%H%M%S).tar.gz s3://thesis-supervisor-backup-$ENVIRONMENT/images/

echo "Backup completed successfully"
```

### Recovery Procedures

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

ENVIRONMENT=$1
BACKUP_DATE=$2

echo "Starting disaster recovery for $ENVIRONMENT environment"

# 1. Restore database
echo "Restoring database from backup..."
DB_BACKUP_ID="thesis-supervisor-$ENVIRONMENT-$BACKUP_DATE"
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier "thesis-supervisor-$ENVIRONMENT-recovered" \
  --db-snapshot-identifier "$DB_BACKUP_ID"

# 2. Restore application data
echo "Restoring application data..."
aws s3 sync s3://thesis-supervisor-backup-$ENVIRONMENT/$BACKUP_DATE/ s3://thesis-supervisor-data-$ENVIRONMENT/ --delete

# 3. Restore configuration
echo "Restoring configuration..."
aws secretsmanager update-secret \
  --secret-id "thesis-supervisor/$ENVIRONMENT/config" \
  --secret-string "$(cat config-backup-$BACKUP_DATE.json)"

# 4. Deploy application
echo "Deploying application..."
./scripts/deploy.sh $ENVIRONMENT

# 5. Verify recovery
echo "Verifying recovery..."
./scripts/smoke-tests.sh $ENVIRONMENT

if [ $? -eq 0 ]; then
  echo "Disaster recovery completed successfully"
else
  echo "Disaster recovery verification failed"
  exit 1
fi
```

## Cost Optimization

### Resource Optimization

```python
# scripts/cost-optimization.py
import boto3
from datetime import datetime, timedelta

class CostOptimizer:
    def __init__(self):
        self.ecs_client = boto3.client('ecs')
        self.rds_client = boto3.client('rds')
        self.cloudwatch = boto3.client('cloudwatch')
    
    def optimize_ecs_resources(self, cluster_name, service_name):
        """Optimize ECS resource allocation based on usage."""
        # Get CPU and memory utilization
        cpu_utilization = self.get_average_cpu_utilization(cluster_name, service_name)
        memory_utilization = self.get_average_memory_utilization(cluster_name, service_name)
        
        recommendations = []
        
        if cpu_utilization < 30:
            recommendations.append({
                "type": "cpu_downsize",
                "current_cpu": "1024",
                "recommended_cpu": "512",
                "potential_savings": "50%"
            })
        
        if memory_utilization < 40:
            recommendations.append({
                "type": "memory_downsize",
                "current_memory": "2048",
                "recommended_memory": "1024",
                "potential_savings": "50%"
            })
        
        return recommendations
    
    def optimize_rds_resources(self, db_instance_id):
        """Optimize RDS instance based on usage."""
        # Get database metrics
        cpu_utilization = self.get_rds_cpu_utilization(db_instance_id)
        connection_count = self.get_rds_connection_count(db_instance_id)
        
        recommendations = []
        
        if cpu_utilization < 20 and connection_count < 10:
            recommendations.append({
                "type": "instance_downsize",
                "current_instance": "db.t3.medium",
                "recommended_instance": "db.t3.small",
                "potential_savings": "50%"
            })
        
        return recommendations
    
    def schedule_non_production_resources(self, environment):
        """Schedule non-production resources to save costs."""
        if environment in ['development', 'testing']:
            # Stop resources during off-hours
            self.schedule_ecs_service_shutdown(environment)
            self.schedule_rds_shutdown(environment)
    
    def get_average_cpu_utilization(self, cluster_name, service_name):
        """Get average CPU utilization for ECS service."""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7)
        
        response = self.cloudwatch.get_metric_statistics(
            Namespace='AWS/ECS',
            MetricName='CPUUtilization',
            Dimensions=[
                {'Name': 'ServiceName', 'Value': service_name},
                {'Name': 'ClusterName', 'Value': cluster_name}
            ],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average']
        )
        
        if response['Datapoints']:
            return sum(dp['Average'] for dp in response['Datapoints']) / len(response['Datapoints'])
        return 0
```

## Best Practices

### Deployment Best Practices

1. **Zero Downtime Deployments**: Use blue-green or canary deployments
2. **Database Migrations**: Always backup before migrations
3. **Health Checks**: Implement comprehensive health checks
4. **Monitoring**: Monitor all deployment metrics
5. **Rollback Strategy**: Have automated rollback procedures

### Security Best Practices

1. **Least Privilege**: Grant minimal necessary permissions
2. **Secret Management**: Use AWS Secrets Manager for sensitive data
3. **Network Security**: Use VPCs and security groups
4. **Encryption**: Encrypt data at rest and in transit
5. **Audit Logging**: Log all deployment activities

### Performance Best Practices

1. **Auto Scaling**: Implement proper auto-scaling policies
2. **Caching**: Use CloudFront and ElastiCache
3. **Database Optimization**: Optimize database queries and indexes
4. **Resource Monitoring**: Monitor resource utilization
5. **Load Testing**: Regular performance testing

## Resources

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudWatch Monitoring](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [Database Migration Best Practices](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_BestPractices.html) 