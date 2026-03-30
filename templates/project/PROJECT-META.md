# {{PROJECT_NAME}} - Project Metadata

> File này chứa thông tin cơ bản về dự án.
> AI đọc file này để generate đúng package, headers, attribution.

## Project Info

| Field | Value |
|-------|-------|
| **Name** | {{PROJECT_NAME}} |
| **Description** | {{PROJECT_DESCRIPTION}} |
| **Inception Year** | {{INCEPTION_YEAR}} |
| **License** | {{LICENSE}} |

## Organization

| Field | Value |
|-------|-------|
| **Name** | {{ORGANIZATION_NAME}} |
| **Website** | {{ORGANIZATION_URL}} |

## Package Structure

| Field | Value |
|-------|-------|
| **Base Package** | `{{PACKAGE_BASE_ID}}` |
| **Group ID** | `{{GROUP_ID}}` |
| **Artifact ID** | `{{ARTIFACT_ID}}` |

### Module Packages
```
{{PACKAGE_BASE_ID}}
├── common          # Shared modules
│   ├── model       # Shared entities, DTOs
│   └── util        # Shared utilities
├── {{MODULE_1}}    # Module 1
│   ├── controller
│   ├── service
│   ├── mapper
│   └── ...
├── {{MODULE_2}}    # Module 2
└── ...
```

## Developers

### Lead Developer
| Field | Value |
|-------|-------|
| **Name** | {{LEAD_DEVELOPER_NAME}} |
| **Email** | {{LEAD_DEVELOPER_EMAIL}} |
| **GitHub** | [@{{LEAD_DEVELOPER_GITHUB}}](https://github.com/{{LEAD_DEVELOPER_GITHUB}}) |
| **Role** | Project Lead, Core Developer |

### Contributors
See [CONTRIBUTORS.md](/CONTRIBUTORS.md)

## Repository

| Field | Value |
|-------|-------|
| **URL** | {{REPOSITORY_URL}} |
| **Issues** | {{ISSUE_TRACKER_URL}} |
| **CI/CD** | {{CI_CD_SYSTEM}} |

## File Headers

### Java File Header
```java
/*
 * {{PROJECT_NAME}}
 * Copyright (c) {{INCEPTION_YEAR}} {{ORGANIZATION_NAME}}
 *
 * Licensed under the {{LICENSE}} License.
 * See LICENSE file in the project root for full license information.
 */
```

### SQL File Header
```sql
-- {{PROJECT_NAME}}
-- Copyright (c) {{INCEPTION_YEAR}} {{ORGANIZATION_NAME}}
-- Licensed under {{LICENSE}} License
```

### Configuration File Header
```yaml
# {{PROJECT_NAME}}
# Copyright (c) {{INCEPTION_YEAR}} {{ORGANIZATION_NAME}}
```

### Shell Script Header
```bash
#!/bin/bash
# {{PROJECT_NAME}}
# Copyright (c) {{INCEPTION_YEAR}} {{ORGANIZATION_NAME}}
# Licensed under {{LICENSE}} License
```

## Author Tag (for Javadoc)
```java
/**
 * Description of the class.
 *
 * @author {{LEAD_DEVELOPER_NAME}}
 * @since {{VERSION}}
 */
```

## Maven POM Template
```xml
<groupId>{{GROUP_ID}}</groupId>
<artifactId>{{ARTIFACT_ID}}</artifactId>
<version>{{VERSION}}</version>

<name>{{PROJECT_NAME}}</name>
<description>{{PROJECT_DESCRIPTION}}</description>
<url>{{REPOSITORY_URL}}</url>
<inceptionYear>{{INCEPTION_YEAR}}</inceptionYear>

<organization>
    <name>{{ORGANIZATION_NAME}}</name>
    <url>{{ORGANIZATION_URL}}</url>
</organization>

<developers>
    <developer>
        <id>{{LEAD_DEVELOPER_GITHUB}}</id>
        <name>{{LEAD_DEVELOPER_NAME}}</name>
        <email>{{LEAD_DEVELOPER_EMAIL}}</email>
    </developer>
</developers>
```
