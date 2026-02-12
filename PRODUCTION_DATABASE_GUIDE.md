# Production Deployment Guide - Speedy Bites

## Database Resilience Implementation

### Overview
The backend now includes enterprise-grade database resilience features to ensure continuous operation even during connection failures.

### Key Features

#### 1. Connection Pooling with Auto-Healing
- **Configuration**: 2-20 connections in pool
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 10 seconds  
- **Max Connection Age**: 2 hours (automatic recycling)
- **Health Check**: Every 30 seconds

#### 2. Circuit Breaker Pattern
- **Threshold**: 5 consecutive failures
- **Timeout**: 60 seconds before retry
- **States**: CLOSED (working) → OPEN (broken) → HALF_OPEN (recovering)
- **Benefit**: Prevents cascading failures

#### 3. Automatic Retry with Exponential Backoff
- **Default Retries**: 3 attempts per query
- **Backoff Formula**: `100ms × 2^(attempt-1)`
- **Retryable Errors**: Connection refused, timeout, DNS failed, reset
- **Non-Retryable**: Authentication errors, syntax errors (fail fast)

#### 4. Health Monitoring
- **Database Health Check**: Every 30 seconds
- **Connection Status**: Real-time in `/api/health`
- **Logging**: All connection issues logged with timestamps
- **Metrics**: Active connections, idle connections, queue depth

### Monitoring the System

#### Check Health Status
```bash
curl http://localhost:4000/api/health
```

Response includes:
```json
{
  "ok": true,
  "status": "operational",
  "database": {
    "connected": true,
    "totalConnections": 5,
    "idleConnections": 4,
    "activeConnections": 1,
    "waitingQueue": 0,
    "status": "Connected"
  },
  "circuitBreaker": {
    "state": "CLOSED",
    "failureCount": 0,
    "threshold": 5
  },
  "uptime": 3600.123
}
```

### Environment Configuration

Set these in your `.env` file:

```env
# Database Pool Settings
DB_POOL_MIN=2          # Minimum connections
DB_POOL_MAX=20         # Maximum connections
DB_SSL=false           # Enable SSL for production
DB_STATEMENT_TIMEOUT=30000  # Query timeout (ms)

# Health Check
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### What Happens During Outages

#### Scenario 1: Temporary Connection Loss (< 1 min)
- Circuit breaker stays CLOSED
- Queries auto-retry with backoff
- Requests show brief delay but succeed
- Health endpoint remains healthy

#### Scenario 2: Extended Outage (> 1 min)
- Circuit breaker opens after 5 failures
- New requests fail fast (no unnecessary retries)
- Returns `503 Service Unavailable` with retry guidance
- System continuously attempts reconnection

#### Scenario 3: Database Recovers
- Health check detects connection restored
- Circuit breaker transitions to HALF_OPEN
- Test query validates connection
- Circuit breaker returns to CLOSED state
- Normal operation resumes

### Handling 503 Responses

When database is unavailable, clients receive:
```json
{
  "error": "Service Unavailable",
  "message": "Database connection temporarily unavailable",
  "status": "Database reconnecting...",
  "retryAfter": 10
}
```

**Client should**:
1. Wait `retryAfter` seconds
2. Retry the request
3. Show user message: "Temporarily unavailable, trying again..."
4. Don't retry more than 3 times

### Logs Location

```
./logs/app.log       # General application logs
./logs/error.log     # Error-specific logs
./logs/audit.log     # Audit trail for changes
```

### Performance Tuning

#### For High Traffic
```env
DB_POOL_MIN=5
DB_POOL_MAX=30
DB_STATEMENT_TIMEOUT=60000
```

#### For Production Stability
```env
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_STATEMENT_TIMEOUT=30000
```

#### For Development/Testing
```env
DB_POOL_MIN=1
DB_POOL_MAX=5
DB_STATEMENT_TIMEOUT=10000
```

### Troubleshooting

#### Problem: "pool timeout"
- **Cause**: Too many concurrent queries
- **Solution**: Increase `DB_POOL_MAX` or optimize queries
- **Check**: Look at `waitingQueue` in health endpoint

#### Problem: Frequent reconnections
- **Cause**: Database instability or network issues
- **Solution**: 
  - Check database server logs
  - Monitor network connectivity
  - Increase `DB_STATEMENT_TIMEOUT`

#### Problem: Slow queries after outage
- **Cause**: Connection pool still warming up
- **Solution**: Normal during recovery, wait 30 seconds

### Monitoring Best Practices

1. **Set up alerting** on `/api/health` endpoint
   - Alert if `database.connected` is false
   - Alert if `circuitBreaker.state` is OPEN

2. **Log aggregation**
   - Send logs to centralized service (ELK, Datadog)
   - Alert on ERROR level logs

3. **Health dashboard**
   - Display pool status in ops dashboard
   - Track circuit breaker state changes

4. **Synthetic monitoring**
   - Periodic test queries to detect issues early
   - Monitor response times

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `TOKEN_SECRET` (min 32 chars)
- [ ] Set `REQUIRE_HTTPS=true` if behind HTTPS proxy
- [ ] Configure database credentials
- [ ] Ensure `./logs` directory is writable
- [ ] Ensure `./uploads` directory exists and is writable
- [ ] Test failover by temporarily stopping database
- [ ] Set up monitoring on `/api/health`
- [ ] Configure log rotation for `./logs`
- [ ] Test recovery after simulated outage

### Scaling Considerations

For production scaling:

1. **Database Replication**
   - Use PostgreSQL streaming replication
   - Configure read replicas for queries
   - Backend automatically handles failover

2. **Load Balancing**
   - Run multiple server instances
   - Use connection pooling at load balancer level
   - Share session store (Redis/Memcached)

3. **Caching Layer**
   - Add Redis for session/cache
   - Reduce database load
   - Faster response times

4. **Monitoring Stack**
   - Prometheus for metrics
   - Grafana for dashboards
   - AlertManager for notifications

### Support

If experiencing persistent connection issues:

1. Check database server is running: `docker ps | grep postgres`
2. Verify network connectivity: `ping database-host`
3. Check credentials in `DATABASE_URL`
4. Review logs in `./logs/error.log`
5. Restart server: `pkill node && npm start`

---

**Last Updated**: 2026-02-12
**Version**: 1.0.0
