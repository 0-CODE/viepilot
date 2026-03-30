# {{PROJECT_NAME}} - Architecture

## System Overview

{{SYSTEM_OVERVIEW_DESCRIPTION}}

```
{{SYSTEM_DIAGRAM}}
```

## Services

{{#SERVICES}}
### {{SERVICE_NAME}}
- **Purpose**: {{SERVICE_PURPOSE}}
- **Inputs**: {{SERVICE_INPUTS}}
- **Outputs**: {{SERVICE_OUTPUTS}}
- **Dependencies**: {{SERVICE_DEPENDENCIES}}
- **API**: {{SERVICE_API_TYPE}}
- **Scaling**: {{SERVICE_SCALING}}
{{/SERVICES}}

## Data Flow

```
{{DATA_FLOW_DIAGRAM}}
```

## Integration Points

| Service A | Service B | Protocol | Endpoint/Topic |
|-----------|-----------|----------|----------------|
{{INTEGRATION_POINTS}}

## Technology Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
{{TECHNOLOGY_DECISIONS}}

## Database Architecture

### Primary Database
- **Type**: {{DB_TYPE}}
- **Purpose**: {{DB_PURPOSE}}

### Cache
- **Type**: {{CACHE_TYPE}}
- **Purpose**: {{CACHE_PURPOSE}}

## Security Architecture

### Authentication
{{AUTH_DESCRIPTION}}

### Authorization
{{AUTHZ_DESCRIPTION}}

## Deployment Architecture

```
{{DEPLOYMENT_DIAGRAM}}
```

## Monitoring & Observability

- **Logging**: {{LOGGING_SOLUTION}}
- **Metrics**: {{METRICS_SOLUTION}}
- **Tracing**: {{TRACING_SOLUTION}}
- **Alerting**: {{ALERTING_SOLUTION}}
