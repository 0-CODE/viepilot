# {{PROJECT_NAME}} - Architecture

## System Overview

{{SYSTEM_OVERVIEW_DESCRIPTION}}

**Diagram source (when Mermaid):** `.viepilot/architecture/system-overview.mermaid`

```
{{SYSTEM_DIAGRAM}}
```

## Architecture Diagram Applicability

> Decide diagram depth from brainstorm complexity signals. Do not force all six as detailed by default.

- **Complexity**: {{ARCH_COMPLEXITY_LEVEL}}  <!-- simple | moderate | complex -->
- **Services/Modules signal**: {{ARCH_SIGNAL_SERVICES}}
- **Event-driven signal**: {{ARCH_SIGNAL_EVENTS}}
- **Deployment signal**: {{ARCH_SIGNAL_DEPLOYMENT}}
- **User-flow signal**: {{ARCH_SIGNAL_USER_FLOWS}}
- **Integration signal**: {{ARCH_SIGNAL_INTEGRATIONS}}

| Diagram type | Status (`required|optional|N/A`) | Reason |
|--------------|----------------------------------|--------|
| system-overview | {{DIAGRAM_STATUS_SYSTEM_OVERVIEW}} | {{DIAGRAM_REASON_SYSTEM_OVERVIEW}} |
| data-flow | {{DIAGRAM_STATUS_DATA_FLOW}} | {{DIAGRAM_REASON_DATA_FLOW}} |
| event-flows | {{DIAGRAM_STATUS_EVENT_FLOWS}} | {{DIAGRAM_REASON_EVENT_FLOWS}} |
| module-dependencies | {{DIAGRAM_STATUS_MODULE_DEPENDENCIES}} | {{DIAGRAM_REASON_MODULE_DEPENDENCIES}} |
| deployment | {{DIAGRAM_STATUS_DEPLOYMENT}} | {{DIAGRAM_REASON_DEPLOYMENT}} |
| user-use-case | {{DIAGRAM_STATUS_USER_USE_CASE}} | {{DIAGRAM_REASON_USER_USE_CASE}} |

## Diagram source files (ENH-022)

When crystallize emits a real Mermaid diagram for a type, it also writes **`.viepilot/architecture/<type>.mermaid`** (raw Mermaid, no markdown fences). Canonical names: `system-overview.mermaid`, `data-flow.mermaid`, `event-flows.mermaid`, `module-dependencies.mermaid`, `deployment.mermaid`, `user-use-case.mermaid`. Types marked **N/A** or without a diagram must **not** get a sidecar file.

Under each diagram section below, when applicable, include **Diagram source** pointing at the matching path. The fenced ` ```mermaid ` body in this file must **mirror** the `.mermaid` file line-for-line.

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

**Diagram source (when generated):** `.viepilot/architecture/data-flow.mermaid`

```
{{DATA_FLOW_DIAGRAM}}
```

### Event Flows

- **Diagram source (when generated):** `.viepilot/architecture/event-flows.mermaid`

- **Status**: {{DIAGRAM_STATUS_EVENT_FLOWS}}
- **Not applicable rationale**: {{DIAGRAM_NA_EVENT_FLOWS}}

```mermaid
flowchart LR
  EventSource --> EventBus --> Consumer
```

### Module Dependencies

- **Diagram source (when generated):** `.viepilot/architecture/module-dependencies.mermaid`

- **Status**: {{DIAGRAM_STATUS_MODULE_DEPENDENCIES}}
- **Not applicable rationale**: {{DIAGRAM_NA_MODULE_DEPENDENCIES}}

```mermaid
flowchart LR
  UI --> Service --> Repository
```

### User Use-Case Flows

- **Diagram source (when generated):** `.viepilot/architecture/user-use-case.mermaid`

- **Status**: {{DIAGRAM_STATUS_USER_USE_CASE}}
- **Not applicable rationale**: {{DIAGRAM_NA_USER_USE_CASE}}

```mermaid
flowchart TD
  User --> Action --> Outcome
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

**Diagram source (when generated):** `.viepilot/architecture/deployment.mermaid`

```
{{DEPLOYMENT_DIAGRAM}}
```

- **Status**: {{DIAGRAM_STATUS_DEPLOYMENT}}
- **Not applicable rationale**: {{DIAGRAM_NA_DEPLOYMENT}}

## Monitoring & Observability

- **Logging**: {{LOGGING_SOLUTION}}
- **Metrics**: {{METRICS_SOLUTION}}
- **Tracing**: {{TRACING_SOLUTION}}
- **Alerting**: {{ALERTING_SOLUTION}}
