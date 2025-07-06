# Quality Attribute Scenarios

## Reliability

### ### Faultlessness

**Why it is important:**  
Our system should perform all requested actions without defects or errors, to ensure student and supervisor interactions work smoothly.

**Quality Attribute Scenario:**  
- Source: Student or Supervisor uses the system
- Stimulus: Requests to view or update project stages
- Environment: Production
- Artifact: Mini app, Back office, API server
- Response: The system completes the request without error
- Response Measure: < 1% of requests result in error

**How we will test it:**  
We will run manual tests and automated unit/integration tests to ensure endpoints respond correctly without failures. Errors will be logged and monitored.

---

### ### Fault Tolerance

**Why it is important:**  
The system must handle unexpected issues without crashing, ensuring continuous availability.

**Quality Attribute Scenario:**  
- Source: System component or external API
- Stimulus: Fails or times out
- Environment: Production
- Artifact: API Server
- Response: Server returns fallback response or meaningful error without crashing
- Response Measure: Recovery in < 5s, error message displayed

**How we will test it:**  
We will simulate API errors and observe if the server handles them gracefully. Automated integration tests will validate fallback responses.

---

### ### Recoverability

**Why it is important:**  
In case of partial failure or data corruption, the system must recover without losing critical information.

**Quality Attribute Scenario:**  
- Source: Infrastructure issue or crash
- Stimulus: Unexpected server crash or loss of connection
- Environment: Production
- Artifact: API server, Database
- Response: The system restarts and restores last consistent state
- Response Measure: Recovery time < 30 seconds, no data loss

**How we will test it:**  
We will test restarting services, review database backups, and validate that sessions and records are preserved after recovery.
