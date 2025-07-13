# Secrets Management

This document outlines the security policies and best practices for managing sensitive information in the Thesis Supervisor System.

## Overview

Proper secrets management is crucial for maintaining the security and integrity of our application. This document covers how to handle database credentials, API keys, tokens, and other sensitive data across different environments.

## Security Principles

### Core Guidelines

1. **Never commit secrets to version control**
2. **Use environment variables for configuration**
3. **Implement the principle of least privilege**
4. **Rotate secrets regularly**
5. **Use secure secret management services in production**
6. **Encrypt secrets at rest and in transit**

## Secret Types

### Database Credentials

- **Connection strings**: Database URLs with authentication
- **Database passwords**: User passwords for database access
- **Connection pool settings**: Sensitive database configuration

### API Keys and Tokens

- **Telegram Bot Token**: Authentication token for Telegram Bot API
- **Email Service Keys**: SMTP authentication credentials
- **Third-party Service Keys**: External API authentication tokens
- **OAuth Credentials**: Client secrets for OAuth providers

### Application Secrets

- **JWT Secret Keys**: Token signing and verification keys
- **Encryption Keys**: Data encryption and decryption keys
- **Session Secrets**: Session management keys
- **CSRF Tokens**: Cross-site request forgery protection

### Infrastructure Secrets

- **SSL Certificates**: TLS/SSL private keys
- **SSH Keys**: Server access keys
- **Cloud Provider Credentials**: AWS/Azure/GCP access keys

## Storage Locations

### Development Environment

#### Local .env Files

```env
# Database
DATABASE_URL=sqlite:///./thesis_db.sqlite3

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ
TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Application
DEBUG=true
SECRET_KEY=your-application-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### .env File Security

- Add `.env` to `.gitignore`
- Never commit `.env` files to version control
- Use `.env.example` as a template with placeholder values
- Set appropriate file permissions (600 on Unix systems)

```bash
# Set proper permissions
chmod 600 .env

# Verify .env is gitignored
echo ".env" >> .gitignore
```

### Staging Environment

#### Environment Variables

```bash
# Set environment variables in staging
export DATABASE_URL="postgresql://user:pass@staging-db:5432/thesis_db"
export TELEGRAM_BOT_TOKEN="staging-bot-token"
export JWT_SECRET_KEY="staging-jwt-secret"
```

#### Docker Secrets

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - TELEGRAM_BOT_TOKEN_FILE=/run/secrets/telegram_token
    secrets:
      - database_url
      - telegram_token

secrets:
  database_url:
    file: ./secrets/database_url.txt
  telegram_token:
    file: ./secrets/telegram_token.txt
```

### Production Environment

#### Cloud Secret Management

##### AWS Secrets Manager

```python
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name="us-east-1"):
    """Retrieve secret from AWS Secrets Manager."""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e
    
    return get_secret_value_response['SecretString']

# Usage
database_url = get_secret("thesis-supervisor/database-url")
```

##### Azure Key Vault

```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

def get_secret_from_keyvault(vault_url, secret_name):
    """Retrieve secret from Azure Key Vault."""
    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=vault_url, credential=credential)
    
    secret = client.get_secret(secret_name)
    return secret.value

# Usage
vault_url = "https://thesis-supervisor-vault.vault.azure.net/"
database_url = get_secret_from_keyvault(vault_url, "database-url")
```

##### Google Cloud Secret Manager

```python
from google.cloud import secretmanager

def get_secret_from_gcp(project_id, secret_name, version="latest"):
    """Retrieve secret from Google Cloud Secret Manager."""
    client = secretmanager.SecretManagerServiceClient()
    
    name = f"projects/{project_id}/secrets/{secret_name}/versions/{version}"
    response = client.access_secret_version(request={"name": name})
    
    return response.payload.data.decode("UTF-8")

# Usage
database_url = get_secret_from_gcp("thesis-supervisor-project", "database-url")
```

### CI/CD Environment

#### GitHub Actions Secrets

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to production
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          JWT_SECRET_KEY: ${{ secrets.JWT_SECRET_KEY }}
        run: |
          # Deployment commands here
```

#### GitLab CI/CD Variables

```yaml
# .gitlab-ci.yml
variables:
  DATABASE_URL: $DATABASE_URL
  TELEGRAM_BOT_TOKEN: $TELEGRAM_BOT_TOKEN

deploy:
  stage: deploy
  script:
    - echo "Deploying with secrets from GitLab CI/CD variables"
  only:
    - main
```

## Configuration Management

### Environment-Specific Configuration

```python
# app/config.py
import os
from typing import Optional

class Config:
    """Base configuration class."""
    
    # Database
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./thesis_db.sqlite3')
    
    # Email
    SMTP_HOST: str = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME: str = os.getenv('SMTP_USERNAME', '')
    SMTP_PASSWORD: str = os.getenv('SMTP_PASSWORD', '')
    SMTP_USE_TLS: bool = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv('TELEGRAM_BOT_TOKEN', '')
    TELEGRAM_WEBHOOK_URL: str = os.getenv('TELEGRAM_WEBHOOK_URL', '')
    
    # Security
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', '')
    JWT_ALGORITHM: str = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_EXPIRATION_HOURS: int = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    
    # Application
    DEBUG: bool = os.getenv('DEBUG', 'false').lower() == 'true'
    SECRET_KEY: str = os.getenv('SECRET_KEY', '')
    ALLOWED_HOSTS: list = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
    
    @classmethod
    def validate(cls) -> None:
        """Validate required configuration."""
        required_secrets = [
            'JWT_SECRET_KEY',
            'SECRET_KEY',
            'TELEGRAM_BOT_TOKEN',
        ]
        
        for secret in required_secrets:
            if not getattr(cls, secret):
                raise ValueError(f"Required secret {secret} is not configured")

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    
    @classmethod
    def validate(cls) -> None:
        """Additional validation for production."""
        super().validate()
        
        # Ensure strong secrets in production
        if len(cls.JWT_SECRET_KEY) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production")
        
        if cls.DATABASE_URL.startswith('sqlite:'):
            raise ValueError("SQLite not recommended for production")

# Configuration selection
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}

def get_config(env: str = 'development') -> Config:
    """Get configuration for environment."""
    config_class = config.get(env, DevelopmentConfig)
    config_class.validate()
    return config_class()
```

### Secret Loading Utilities

```python
# app/utils/secrets.py
import os
import json
from typing import Optional, Dict, Any

class SecretsManager:
    """Utility class for managing secrets across environments."""
    
    @staticmethod
    def load_from_env(key: str, default: Optional[str] = None) -> str:
        """Load secret from environment variable."""
        value = os.getenv(key, default)
        if not value:
            raise ValueError(f"Secret {key} not found in environment")
        return value
    
    @staticmethod
    def load_from_file(file_path: str) -> str:
        """Load secret from file (for Docker secrets)."""
        try:
            with open(file_path, 'r') as f:
                return f.read().strip()
        except FileNotFoundError:
            raise ValueError(f"Secret file {file_path} not found")
    
    @staticmethod
    def load_json_secret(key: str) -> Dict[str, Any]:
        """Load JSON secret from environment."""
        json_str = SecretsManager.load_from_env(key)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in secret {key}")
    
    @staticmethod
    def get_database_url() -> str:
        """Get database URL from environment or file."""
        # Try environment variable first
        url = os.getenv('DATABASE_URL')
        if url:
            return url
        
        # Try Docker secret file
        file_path = os.getenv('DATABASE_URL_FILE')
        if file_path:
            return SecretsManager.load_from_file(file_path)
        
        raise ValueError("DATABASE_URL not configured")
```

## Security Best Practices

### Secret Generation

#### Strong Random Secrets

```python
import secrets
import string

def generate_secret_key(length: int = 64) -> str:
    """Generate cryptographically strong secret key."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_jwt_secret() -> str:
    """Generate JWT secret key."""
    return secrets.token_urlsafe(32)

# Usage
jwt_secret = generate_jwt_secret()
app_secret = generate_secret_key()
```

#### Password Hashing

```python
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Hash password using secure method."""
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash."""
    return check_password_hash(password_hash, password)
```

### Secret Rotation

#### Rotation Schedule

- **Database passwords**: Every 90 days
- **API keys**: Every 60 days
- **JWT secrets**: Every 30 days
- **SSL certificates**: Before expiration

#### Rotation Process

```python
# app/utils/rotation.py
import os
from datetime import datetime, timedelta
from typing import List

class SecretRotationManager:
    """Manage secret rotation lifecycle."""
    
    def __init__(self, secret_store):
        self.secret_store = secret_store
    
    def rotate_jwt_secret(self) -> str:
        """Rotate JWT secret key."""
        new_secret = generate_jwt_secret()
        
        # Store new secret
        self.secret_store.store_secret('JWT_SECRET_KEY', new_secret)
        
        # Update environment
        os.environ['JWT_SECRET_KEY'] = new_secret
        
        return new_secret
    
    def get_rotation_schedule(self) -> List[dict]:
        """Get upcoming secret rotations."""
        schedule = []
        
        # Check each secret's last rotation date
        secrets_to_check = [
            ('JWT_SECRET_KEY', 30),  # Rotate every 30 days
            ('DATABASE_PASSWORD', 90),  # Rotate every 90 days
            ('TELEGRAM_BOT_TOKEN', 365),  # Rotate yearly
        ]
        
        for secret_name, rotation_days in secrets_to_check:
            last_rotation = self.secret_store.get_last_rotation(secret_name)
            if last_rotation:
                next_rotation = last_rotation + timedelta(days=rotation_days)
                schedule.append({
                    'secret': secret_name,
                    'next_rotation': next_rotation,
                    'overdue': next_rotation < datetime.now()
                })
        
        return schedule
```

### Access Control

#### Role-Based Access

```python
# app/models/permissions.py
from enum import Enum
from typing import List, Dict

class SecretPermission(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ROTATE = "rotate"

class SecretRole(Enum):
    DEVELOPER = "developer"
    ADMIN = "admin"
    CI_CD = "ci_cd"
    PRODUCTION = "production"

SECRET_PERMISSIONS: Dict[SecretRole, List[SecretPermission]] = {
    SecretRole.DEVELOPER: [SecretPermission.READ],
    SecretRole.ADMIN: [
        SecretPermission.READ,
        SecretPermission.WRITE,
        SecretPermission.DELETE,
        SecretPermission.ROTATE
    ],
    SecretRole.CI_CD: [SecretPermission.READ],
    SecretRole.PRODUCTION: [SecretPermission.READ]
}
```

## Monitoring and Auditing

### Secret Usage Monitoring

```python
# app/utils/monitoring.py
import logging
from datetime import datetime
from typing import Optional

class SecretAuditLogger:
    """Log secret access for security monitoring."""
    
    def __init__(self):
        self.logger = logging.getLogger('secret_audit')
        self.logger.setLevel(logging.INFO)
    
    def log_secret_access(self, secret_name: str, user: str, action: str, 
                         success: bool, ip_address: Optional[str] = None):
        """Log secret access attempt."""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'secret_name': secret_name,
            'user': user,
            'action': action,
            'success': success,
            'ip_address': ip_address
        }
        
        self.logger.info(f"Secret access: {log_entry}")
    
    def log_secret_rotation(self, secret_name: str, rotated_by: str):
        """Log secret rotation event."""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'secret_name': secret_name,
            'action': 'rotate',
            'rotated_by': rotated_by
        }
        
        self.logger.info(f"Secret rotation: {log_entry}")
```

### Security Alerts

```python
# app/utils/alerts.py
import smtplib
from email.mime.text import MIMEText

class SecurityAlertManager:
    """Send security alerts for suspicious secret access."""
    
    def __init__(self, smtp_config):
        self.smtp_config = smtp_config
    
    def send_alert(self, subject: str, message: str, recipients: list):
        """Send security alert email."""
        msg = MIMEText(message)
        msg['Subject'] = f"[SECURITY ALERT] {subject}"
        msg['From'] = self.smtp_config['username']
        msg['To'] = ', '.join(recipients)
        
        with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
            server.starttls()
            server.login(self.smtp_config['username'], self.smtp_config['password'])
            server.send_message(msg)
    
    def alert_secret_access_failure(self, secret_name: str, user: str, ip: str):
        """Alert on failed secret access."""
        subject = f"Failed secret access: {secret_name}"
        message = f"""
        Failed attempt to access secret '{secret_name}'
        User: {user}
        IP Address: {ip}
        Time: {datetime.utcnow().isoformat()}
        
        Please investigate this security incident.
        """
        
        self.send_alert(subject, message, ['security@thesis-supervisor.com'])
```

## Common Vulnerabilities

### What to Avoid

#### Hardcoded Secrets

```python
# ❌ BAD - Never do this
DATABASE_URL = "postgresql://user:password123@localhost/db"
JWT_SECRET = "my-secret-key"

# ✅ GOOD - Use environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
JWT_SECRET = os.getenv('JWT_SECRET_KEY')
```

#### Secrets in Log Files

```python
# ❌ BAD - Secret might be logged
logging.info(f"Connecting to database: {DATABASE_URL}")

# ✅ GOOD - Sanitize sensitive data
logging.info("Connecting to database: [REDACTED]")
```

#### Weak Secret Generation

```python
# ❌ BAD - Predictable
secret = "password123"
token = str(time.time())

# ✅ GOOD - Cryptographically secure
secret = secrets.token_urlsafe(32)
token = secrets.token_hex(16)
```

### Security Checklist

- [ ] No secrets committed to version control
- [ ] All secrets stored in environment variables or secret managers
- [ ] Strong, randomly generated secrets
- [ ] Regular secret rotation schedule
- [ ] Access controls and permissions in place
- [ ] Audit logging for secret access
- [ ] Monitoring and alerting for suspicious activity
- [ ] Secrets encrypted at rest and in transit
- [ ] Backup and recovery procedures for secrets
- [ ] Documentation for secret management procedures

## Incident Response

### Compromised Secret Response

1. **Immediate Actions**
   - Rotate the compromised secret immediately
   - Revoke access for affected systems
   - Change all related credentials

2. **Investigation**
   - Review audit logs for unauthorized access
   - Identify scope of compromise
   - Determine attack vector

3. **Recovery**
   - Deploy new secrets to all environments
   - Verify system functionality
   - Monitor for continued threats

4. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Conduct security training

### Emergency Contacts

- **Security Team**: security@thesis-supervisor.com
- **DevOps Team**: devops@thesis-supervisor.com
- **On-Call Engineer**: +1-555-SECURITY

## Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App Config](https://12factor.net/config)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/)
- [Google Secret Manager](https://cloud.google.com/secret-manager)
- [HashiCorp Vault](https://www.vaultproject.io/) 