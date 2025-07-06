# Quality Attribute Scenarios

## Usability

### Learnability
**Why important**: New students and supervisors must be able to quickly learn and use the system without extensive training, reducing onboarding time and support costs.

#### Scenario 1: New Student Onboarding
**Source**: New student user
**Stimulus**: First-time access to the system
**Environment**: Normal operation
**Artifact**: User interface
**Response**: User successfully completes profile setup and understands basic navigation
**Response Measure**: 90% of new users complete onboarding within 10 minutes without assistance

**How to execute**: 
1. Set up user testing session with 10 new students
2. Provide system access without prior training
3. Measure time to complete registration and first task submission
4. Record user confusion points and help requests
5. Calculate success rate within time limit

#### Scenario 2: Supervisor Interface Comprehension
**Source**: New supervisor user
**Stimulus**: First-time dashboard access
**Environment**: Normal operation with 5 assigned students
**Artifact**: Supervisor dashboard
**Response**: Supervisor locates and uses all main features (student list, milestone setting, meeting scheduling)
**Response Measure**: All main features identified and used within 15 minutes

**How to execute**:
1. Create test environment with sample student data
2. Observe supervisor navigating dashboard without guidance
3. Use think-aloud protocol to understand mental model
4. Measure task completion time and error rate
5. Verify all critical features are discovered and used

## Reliability

### Fault Tolerance
**Why important**: System must continue operating even when components fail, ensuring continuous access to thesis supervision functionality for academic deadlines.

#### Scenario 1: Database Connection Loss
**Source**: Database server
**Stimulus**: Temporary database connection failure
**Environment**: Peak usage with 100 concurrent users
**Artifact**: Database connection layer
**Response**: System maintains basic functionality using cache, displays appropriate error messages
**Response Measure**: System remains responsive with degraded functionality for 99% of user requests

**How to execute**:
1. Set up automated testing environment with database failover simulation
2. Generate realistic user load (100 concurrent users)
3. Simulate 30-second database connection loss
4. Monitor system response times and error rates
5. Verify graceful degradation and recovery

#### Scenario 2: Email Service Outage
**Source**: Email service provider
**Stimulus**: Email service becomes unavailable
**Environment**: Normal operation during notification-heavy period
**Artifact**: Email notification system
**Response**: System queues notifications and delivers them when service recovers
**Response Measure**: 100% of notifications delivered within 1 hour of service restoration

**How to execute**:
1. Configure test environment with email service simulation
2. Generate notification events (deadlines, submissions)
3. Simulate email service outage for 30 minutes
4. Monitor notification queue and delivery status
5. Verify all queued notifications are delivered upon service recovery

## Performance Efficiency

### Time Behavior
**Why important**: Fast response times are critical for user satisfaction and productivity, especially during peak periods like deadline submissions.

#### Scenario 1: Dashboard Loading Performance
**Source**: Multiple concurrent users
**Stimulus**: 50 users simultaneously accessing supervisor dashboard
**Environment**: Normal operation during peak hours
**Artifact**: Web application server
**Response**: All dashboards load completely with data
**Response Measure**: 95% of dashboard requests complete within 3 seconds

**How to execute**:
1. Set up load testing environment with realistic data volumes
2. Use automated testing tools (JMeter/Locust) to simulate 50 concurrent users
3. Monitor server response times and resource utilization
4. Measure page load times from user perspective
5. Verify performance under sustained load

#### Scenario 2: File Upload Performance
**Source**: Student users
**Stimulus**: 20 students uploading 10MB thesis documents simultaneously
**Environment**: Normal network conditions
**Artifact**: File upload system
**Response**: All files uploaded successfully without timeout
**Response Measure**: 95% of uploads complete within 30 seconds

**How to execute**:
1. Prepare test files of specified size (10MB documents)
2. Simulate 20 concurrent upload sessions
3. Monitor upload progress and completion rates
4. Measure bandwidth utilization and server performance
5. Verify file integrity after upload

## Security

### Confidentiality
**Why important**: Academic work and personal data must be protected from unauthorized access to maintain trust and comply with data protection regulations.

#### Scenario 1: Unauthorized Data Access Attempt
**Source**: Malicious external actor
**Stimulus**: Attempt to access student thesis data without authentication
**Environment**: Normal operation with standard security measures
**Artifact**: Authentication and authorization system
**Response**: Access denied, security event logged, no data exposed
**Response Measure**: 100% of unauthorized access attempts blocked and logged

**How to execute**:
1. Set up penetration testing environment
2. Attempt various unauthorized access methods (direct URL access, session hijacking)
3. Use automated security scanning tools
4. Monitor security logs for proper event recording
5. Verify data remains protected under all attack scenarios

#### Scenario 2: Password Security Validation
**Source**: System user
**Stimulus**: User attempts to set weak password
**Environment**: Account creation or password reset
**Artifact**: Password validation system
**Response**: Weak password rejected with clear requirements shown
**Response Measure**: 100% of weak passwords (less than 8 characters, no special characters) rejected

**How to execute**:
1. Create automated test suite with various password combinations
2. Test password strength validation rules
3. Verify rejection of common weak passwords
4. Ensure clear error messages guide users
5. Confirm password policy enforcement consistency

### Accountability
**Why important**: All system actions must be traceable for academic integrity and dispute resolution purposes.

#### Scenario 3: Audit Trail Completeness
**Source**: System administrator
**Stimulus**: Request for complete audit trail of student submission process
**Environment**: Normal operation over 30-day period
**Artifact**: Logging and audit system
**Response**: Complete chronological record of all actions provided
**Response Measure**: 100% of user actions logged with timestamp, user ID, and action details

**How to execute**:
1. Configure comprehensive logging for all user actions
2. Perform various user activities over test period
3. Generate audit reports covering all system interactions
4. Verify log completeness and accuracy
5. Test log integrity and tamper-evidence mechanisms 