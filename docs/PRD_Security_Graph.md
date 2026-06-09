# Product Requirements Document: Snyk Security Graph

**Document Version**: 1.0  
**Last Updated**: June 9, 2026  
**Author**: Maor Kuriel  
**Status**: Draft  
**Target Release**: H2 2026

---

## Executive Summary

Snyk Security Graph is a unified graph analytics platform that connects fragmented security data across code, dependencies, containers, infrastructure, and runtime environments. By normalizing data from multiple Snyk products (Code, Open Source, Container, IaC) and EVO assets into a single traversable graph, it enables organizations to understand true risk, blast radius, and attack paths—powering next-generation agentic AppSec automation.

**Core Innovation**: Zero-ETL graph analytics that queries existing data stores in-place, eliminating data duplication while enabling real-time multi-hop traversals across petabyte-scale security datasets.

---

## 1. Problem Statement

### 1.1 The Fragmented Security Data Challenge

Modern applications span multiple layers—source code, open source dependencies, containers, cloud infrastructure, and runtime workloads. Each layer generates security telemetry (vulnerabilities, secrets, misconfigurations, threats), but this data lives in **isolated silos**:

- **Snyk Code** → Code-level vulnerabilities in repositories
- **Snyk Open Source** → Package vulnerabilities and license risks
- **Snyk Container** → Image vulnerabilities and base image issues
- **Snyk IaC** → Infrastructure misconfigurations
- **EVO** → Asset inventory and security posture
- **Runtime Telemetry** → Active exploits and anomalies (future)

### 1.2 What's Broken Today

**Problem 1: No Relationship Context**
- A vulnerability in `log4j-core:2.14.1` appears as an isolated finding
- Security teams can't answer: *"Which production services are affected?"*
- No visibility into transitive dependencies or blast radius

**Problem 2: Manual Correlation is Impossible at Scale**
- Organizations have 10,000+ repositories, 100,000+ packages, millions of dependency edges
- Manually tracing "code → package → container → deployment → cloud resource" takes hours
- By the time correlation is done, the data is stale

**Problem 3: Scattered Data Prevents Agentic Automation**
- AI agents need unified context to make remediation decisions
- Today they must query 5+ APIs, correlate results manually, and hope data is consistent
- No single "graph query" can answer: *"Show me all production RDS databases accessible by services with exposed AWS keys"*

**Problem 4: Executives Can't See True Risk**
- Security dashboards show vulnerability counts, not business impact
- A critical CVE in a dev branch != a critical CVE in production payment service
- No way to prioritize based on: *severity × exposure × asset criticality × exploitability*

### 1.3 The Data Normalization Challenge

Security data arrives in different formats, schemas, and update cadences:
- **Snyk Code**: Per-repository SAST findings
- **Snyk Open Source**: Per-project SCA results (manifest files)
- **Snyk Container**: Per-image scan results
- **Snyk IaC**: Per-file static analysis
- **EVO**: Cloud asset inventory (AWS, GCP, Azure APIs)
- **Git**: Repository metadata, ownership, branches
- **CI/CD**: Build artifacts, deployment history
- **Runtime**: Logs, traces, metrics (future)

**Without normalization**, these datasets can't be joined or traversed. With traditional approaches (ETL pipelines, data warehouses), normalization is:
- **Fragile**: ETL breaks when schemas change
- **Expensive**: Full data copies in separate graph databases
- **Stale**: Minutes-to-hours lag between source updates and graph freshness

---

## 2. Solution Overview

### 2.1 The Snyk Security Graph

A **unified, real-time graph** that models all security entities (vulnerabilities, packages, projects, assets, issues) as **nodes** and their relationships (affects, depends_on, deploys_to, accesses) as **edges**.

**Key Principles**:
1. **Zero-ETL**: Query existing data stores (Postgres, Snowflake, BigQuery) as a graph in-place
2. **Real-Time**: Graph view reflects latest scan results immediately (no ETL lag)
3. **Multi-Hop Traversals**: Answer 10-hop queries (e.g., CVE → pkg → dep → project → org → service → cloud resource) in seconds
4. **Agentic-Native**: Unified API for AI agents to query, reason, and act on security data

### 2.2 How It Solves the Problems

| Problem | Solution |
|---------|----------|
| **No Relationship Context** | Graph edges capture ALL relationships: `(Vulnerability)-[:AFFECTS]->(Package)-[:USED_BY]->(Project)-[:DEPLOYS_TO]->(Service)` |
| **Manual Correlation** | Single graph query replaces 10+ API calls: `MATCH path = (vuln)-[*1..10]->(cloud_resource) WHERE vuln.cve = 'CVE-2021-44228' AND cloud_resource.env = 'production'` |
| **Scattered Data** | Zero-ETL engine normalizes data at query time—no separate graph database to maintain |
| **No True Risk Visibility** | Graph analytics compute: `risk_score = severity × path_length × asset_criticality × exposure_time` |

### 2.3 Zero-ETL Data Normalization

**Traditional Graph Database Approach** (Wiz, Datadog):
```
[Snyk Products] → ETL Pipelines → Graph DB (Neo4j) → Query API
```
- ❌ Data duplication (full copy in graph DB)
- ❌ ETL maintenance burden (schema drift, failures)
- ❌ Freshness lag (minutes to hours)
- ❌ High cost (separate database cluster)

**Snyk Security Graph Approach** (Zero-ETL):
```
[Snyk Products] → Postgres/Snowflake → Graph Query Engine → Query API
                                    ↓
                              Schema Mapping Layer
                              (graph_schema.yaml)
```
- ✅ No data duplication (queries source data in-place)
- ✅ Zero ETL maintenance (schema mapping declarative)
- ✅ Real-time freshness (queries live data)
- ✅ Low cost (uses existing infrastructure)

**How Normalization Works**:
1. **Schema Mapping**: `graph_schema.yaml` defines how relational tables map to graph nodes/edges
   ```yaml
   nodes:
     - name: Vulnerability
       source: vulnerabilities
       id_field: cve_id
       properties: [severity, cvss_score, published_date]
     
     - name: Package
       source: packages
       id_field: package_id
       properties: [name, version, ecosystem]
   
   edges:
     - name: AFFECTS
       from: Vulnerability
       to: Package
       source: package_vulnerabilities
       join: [vulnerability_id, package_id]
   ```

2. **Query Compilation**: Graph queries (Cypher-like) compile to optimized SQL
   ```cypher
   MATCH (v:Vulnerability {cve: 'CVE-2021-44228'})-[:AFFECTS]->(p:Package)
   RETURN p.name, p.version
   ```
   ↓ compiles to ↓
   ```sql
   SELECT p.name, p.version
   FROM packages p
   JOIN package_vulnerabilities pv ON p.package_id = pv.package_id
   JOIN vulnerabilities v ON pv.vulnerability_id = v.vulnerability_id
   WHERE v.cve_id = 'CVE-2021-44228'
   ```

3. **Multi-Hop Traversals**: Recursive CTEs for arbitrary-depth paths
   ```sql
   WITH RECURSIVE blast_radius AS (
     -- Base: direct dependencies
     SELECT package_id, 1 as depth FROM package_vulnerabilities WHERE vulnerability_id = 'CVE-2021-44228'
     UNION ALL
     -- Recursive: transitive dependencies
     SELECT pd.dependent_package_id, br.depth + 1
     FROM blast_radius br
     JOIN package_dependencies pd ON br.package_id = pd.package_id
     WHERE br.depth < 10
   )
   SELECT * FROM blast_radius;
   ```

---

## 3. User Personas

### 3.1 Primary Users

**Persona 1: AppSec Engineer (Alex)**
- **Role**: Application Security, Platform Security Team
- **Goals**: 
  - Understand blast radius of critical vulnerabilities
  - Prioritize remediation based on production exposure
  - Track secrets exposure to cloud resources
- **Pain Points**: 
  - Manually correlating data across Snyk products
  - Can't answer "what's affected in production?" quickly
  - Too many low-priority alerts, can't focus on real risk
- **JTBD**: *When a critical CVE drops, I need to instantly see which production services are affected so I can coordinate emergency patches.*

**Persona 2: Security Architect (Sam)**
- **Role**: Security Architecture, Engineering Leadership
- **Goals**: 
  - Design secure supply chain policies
  - Enforce least-privilege IAM across cloud assets
  - Enable shift-left security without slowing developers
- **Pain Points**: 
  - No visibility into code-to-cloud attack paths
  - Can't model risk across the full software stack
  - Policy violations detected too late (post-deployment)
- **JTBD**: *When designing cloud architecture, I need to model attack paths from code to production so I can enforce defense-in-depth controls.*

**Persona 3: Product Security Manager (Morgan)**
- **Role**: Product Security, Security Engineering Management
- **Goals**: 
  - Report security posture to executives
  - Prove compliance with SOC2, ISO27001
  - Demonstrate risk reduction quarter-over-quarter
- **Pain Points**: 
  - Security metrics don't reflect business impact
  - Executives ask "are we secure?" and get vulnerability counts, not risk scores
  - Can't show ROI of security investments
- **JTBD**: *When reporting to the board, I need to show true risk trends (not just vuln counts) so executives understand our security posture.*

### 3.2 Secondary Users

**Persona 4: Platform Engineer (Dev)**
- **Use Case**: Self-service security insights in CI/CD
- **JTBD**: *When my build fails due to a vulnerability, I need to see what dependencies pulled it in so I can fix it quickly.*

**Persona 5: CISO (Executive)**
- **Use Case**: Board-level risk reporting, compliance dashboards
- **JTBD**: *When preparing for the board meeting, I need a single-page view of our security risk across all products so I can communicate clearly.*

**Persona 6: SOC Analyst (Incident Responder)**
- **Use Case**: Incident investigation, threat hunting
- **JTBD**: *When we detect a supply chain attack, I need to trace which systems ingested the malicious package so we can contain the breach.*

---

## 4. Jobs to be Done

### 4.1 Core Jobs

**JTBD #1: Understand Blast Radius**
- *As an AppSec Engineer, when a critical vulnerability is published, I need to see which production services are affected within seconds, so I can prioritize remediation based on business impact.*
- **Acceptance Criteria**:
  - Graph query returns all affected services in <3 seconds
  - Results include: service name, environment, deployment time, cloud resources accessed
  - Auto-prioritized by risk score (severity × production exposure × asset criticality)

**JTBD #2: Trace Code-to-Cloud Attack Paths**
- *As a Security Architect, when analyzing a security finding, I need to trace the full path from source code to cloud resources, so I can understand the true attack surface.*
- **Acceptance Criteria**:
  - Graph shows path: `Code Issue → Package → Container → Deployment → Service → Cloud Resource`
  - Each hop includes: relationship type, metadata, last verified timestamp
  - Visual path rendering in UI with environment labels

**JTBD #3: Prioritize by Production Exposure**
- *As an AppSec Engineer, when triaging vulnerabilities, I need to see which are in production vs. development, so I can focus on real risk instead of noise.*
- **Acceptance Criteria**:
  - All findings tagged with environment (production, staging, dev)
  - Risk score multiplier: production = 5x, staging = 2x, dev = 1x
  - Auto-filter for "production-only" vulnerabilities

**JTBD #4: Enable Agentic Automation**
- *As a Security Platform Team, when building AI agents for remediation, I need a unified graph API, so agents can reason across all security data without manual correlation.*
- **Acceptance Criteria**:
  - Single API endpoint for graph queries (GraphQL or Cypher-like DSL)
  - Agents can traverse 10+ hops in one query
  - Response time <500ms for typical agent queries

**JTBD #5: Report True Risk to Executives**
- *As a Product Security Manager, when reporting to executives, I need to show risk trends (not just vuln counts), so leadership understands if we're getting more or less secure.*
- **Acceptance Criteria**:
  - Graph analytics compute: total risk exposure = Σ(severity × production_assets × exposure_time)
  - Trend charts show risk over time, segmented by product/team
  - Export to executive dashboard (PDF, Grafana, Tableau)

### 4.2 Advanced Jobs (Phase 2)

**JTBD #6: License Risk Propagation**
- *When using open source dependencies, I need to see how copyleft licenses propagate through my dependency tree, so I can avoid compliance violations.*

**JTBD #7: Secrets Exposure Scope**
- *When a secret is exposed, I need to see which cloud resources it has access to, so I can assess the blast radius and rotate keys urgently.*

**JTBD #8: Supply Chain Policy Enforcement**
- *When a new package is added, I need to check if it violates our supply chain policies (e.g., no GPL, no critical CVEs), so we can block it before merge.*

---

## 5. Technical Architecture

### 5.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Applications                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web UI     │  │  AI Agents   │  │  CLI / IDE Plugin   │  │
│  │ (React/Next) │  │  (Agentic)   │  │  (VSCode, IntelliJ) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼─────────────────────┼──────────────┘
          │                  │                     │
          └──────────────────┼─────────────────────┘
                             ▼
          ┌──────────────────────────────────────────────┐
          │      Graph Query API (GraphQL / REST)       │
          │  - Authentication (OAuth2, API keys)        │
          │  - Rate limiting (per-user, per-org)        │
          │  - Query authorization (RBAC)               │
          └──────────────────┬───────────────────────────┘
                             ▼
          ┌──────────────────────────────────────────────┐
          │         Security Graph Engine               │
          │  ┌────────────────────────────────────────┐ │
          │  │  Query Compiler (Cypher → SQL)        │ │
          │  │  - Parser (Cypher AST)                │ │
          │  │  - Optimizer (predicate pushdown)     │ │
          │  │  - Code generator (Postgres SQL)      │ │
          │  └────────────────────────────────────────┘ │
          │  ┌────────────────────────────────────────┐ │
          │  │  Schema Mapping Layer                 │ │
          │  │  - graph_schema.yaml parser           │ │
          │  │  - Node/edge type registry            │ │
          │  │  - Relationship cardinality rules     │ │
          │  └────────────────────────────────────────┘ │
          │  ┌────────────────────────────────────────┐ │
          │  │  Query Execution Engine               │ │
          │  │  - Connection pooling                 │ │
          │  │  - Result streaming (large graphs)    │ │
          │  │  - Caching (query plan, results)      │ │
          │  └────────────────────────────────────────┘ │
          └──────────────────┬───────────────────────────┘
                             ▼
          ┌──────────────────────────────────────────────┐
          │         Data Sources (Zero-ETL)             │
          │  ┌─────────────┐  ┌─────────────────────┐   │
          │  │  Postgres   │  │  Snowflake/BigQuery│   │
          │  │  (OLTP)     │  │  (Analytics)       │   │
          │  │             │  │                     │   │
          │  │ • Vulns     │  │ • Scan history     │   │
          │  │ • Packages  │  │ • Telemetry        │   │
          │  │ • Projects  │  │ • Audit logs       │   │
          │  │ • Assets    │  │                     │   │
          │  └─────────────┘  └─────────────────────┘   │
          └──────────────────────────────────────────────┘
```

### 5.2 Data Ingestion Strategy

**Phase 1: Snyk Product Data** (existing Postgres)
- Snyk Code → `code_issues` table
- Snyk Open Source → `packages`, `package_vulnerabilities`, `package_dependencies`
- Snyk Container → `container_images`, `image_vulnerabilities`
- Snyk IaC → `iac_scans`, `iac_misconfigurations`

**Phase 2: EVO Assets** (existing EVO backend)
- Cloud assets → `cloud_resources` (AWS, GCP, Azure)
- Services → `services`, `service_deployments`
- Relationships → `service_cloud_access` (which service can access which resource)

**Phase 3: External Context** (new integrations)
- Git metadata → `repositories`, `commits`, `pull_requests` (GitHub/GitLab API)
- CI/CD → `builds`, `deployments` (Jenkins/GitHub Actions webhooks)
- Runtime → `runtime_events` (future: Snyk Runtime sensors)

**No ETL Required**: All data stays in source systems. Graph engine queries in-place.

### 5.3 Schema Mapping (Normalization Layer)

**Node Types** (20+):
- `Vulnerability` (CVEs, security advisories)
- `Package` (npm, Maven, PyPI, etc.)
- `Dependency` (transitive deps)
- `Repository` (Git repos)
- `Project` (Snyk projects)
- `Organization` (Snyk orgs)
- `ContainerImage` (Docker images)
- `IaCFile` (Terraform, K8s manifests)
- `Service` (deployed services)
- `CloudResource` (RDS, S3, Lambda, etc.)
- `Secret` (exposed API keys, passwords)
- `License` (OSS licenses)
- `User` (developers, owners)
- `Team` (org structure)

**Edge Types** (15+):
- `AFFECTS` (Vulnerability → Package)
- `DEPENDS_ON` (Package → Package)
- `USED_BY` (Package → Project)
- `OWNS` (Organization → Project)
- `DEPLOYED_BY` (Project → Service)
- `RUNS_IN` (Service → CloudResource)
- `ACCESSES` (Service → CloudResource)
- `FOUND_IN` (Secret → Repository)
- `HAS_LICENSE` (Package → License)
- `VIOLATES` (Package → Policy)
- `AUTHORED_BY` (Commit → User)
- `DEPLOYED_TO` (Repository → Service)
- `SCANNED_BY` (Asset → ScanJob)

**Property Normalization**:
- **Severity Mapping**: All products map to `[critical, high, medium, low]`
- **Environment Tagging**: All assets tagged with `[production, staging, development, test]`
- **Timestamps**: ISO 8601 format, UTC timezone
- **IDs**: UUIDs or composite keys (e.g., `org:proj:asset`)

### 5.4 Query Performance Strategy

**Challenge**: Multi-hop graph queries can be slow on relational databases.

**Optimizations**:
1. **Composite Indexes**: Index foreign key pairs for joins
   ```sql
   CREATE INDEX idx_pkg_vuln ON package_vulnerabilities(vulnerability_id, package_id);
   CREATE INDEX idx_pkg_deps ON package_dependencies(package_id, dependency_id);
   ```

2. **Predicate Pushdown**: Apply filters early in query plan
   ```cypher
   MATCH (v:Vulnerability)-[:AFFECTS]->(p:Package)
   WHERE v.severity = 'critical' AND p.environment = 'production'
   ```
   → Push `WHERE` clauses into JOIN conditions

3. **Recursive CTE Limits**: Cap traversal depth (default 10 hops)
   ```sql
   WITH RECURSIVE paths AS (...) WHERE depth <= 10
   ```

4. **Result Streaming**: Return results incrementally (don't buffer full result set)

5. **Query Plan Caching**: Cache compiled SQL for frequent graph patterns

**Performance Targets**:
- Simple queries (1-3 hops): <100ms
- Complex queries (4-10 hops): <3 seconds
- Large result sets (1000+ nodes): streaming, <5 seconds to first result

---

## 6. Data Model & Schema

### 6.1 Core Entities

**Vulnerability Node**
```yaml
properties:
  - cve_id: string (unique)
  - severity: enum [critical, high, medium, low]
  - cvss_score: float
  - cvss_vector: string
  - published_date: datetime
  - description: text
  - references: array<string>
  - exploitable: boolean
  - exploit_maturity: enum [unproven, proof_of_concept, functional, high]
```

**Package Node**
```yaml
properties:
  - package_id: uuid
  - name: string
  - version: string
  - ecosystem: enum [npm, maven, pypi, nuget, go, rubygems]
  - latest_version: string
  - is_deprecated: boolean
  - maintainer: string
  - license: string
```

**Service Node** (EVO)
```yaml
properties:
  - service_id: uuid
  - name: string
  - environment: enum [production, staging, development]
  - deployment_time: datetime
  - owner_team: string
  - criticality: enum [critical, high, medium, low]
  - cloud_provider: enum [aws, gcp, azure, on_prem]
```

**CloudResource Node** (EVO)
```yaml
properties:
  - resource_id: string (ARN, resource URI)
  - resource_type: enum [rds, s3, lambda, ec2, gcs, blob_storage, ...]
  - environment: enum [production, staging, development]
  - public_access: boolean
  - encryption_enabled: boolean
  - last_accessed: datetime
```

### 6.2 Relationship Schema

**AFFECTS Edge** (Vulnerability → Package)
```yaml
properties:
  - discovered_date: datetime
  - fixed_version: string
  - patch_available: boolean
  - snyk_scan_id: uuid
```

**DEPENDS_ON Edge** (Package → Package)
```yaml
properties:
  - dependency_type: enum [direct, transitive]
  - version_constraint: string (e.g., ">=1.2.0, <2.0.0")
  - scope: enum [runtime, development, test]
```

**ACCESSES Edge** (Service → CloudResource)
```yaml
properties:
  - permission_level: enum [read, write, admin]
  - last_verified: datetime
  - access_method: enum [iam_role, access_key, service_account]
  - credential_id: string (if applicable)
```

---

## 7. User Experience

### 7.1 Web UI (Primary Interface)

**Security Graph Explorer**
- Interactive graph visualization (Cytoscape.js or D3.js)
- Click any node → detailed side panel with:
  - Asset information (type, owner, environment, version)
  - Security posture (issue counts by severity)
  - Related assets (1-hop neighbors)
  - Actions (view in Snyk, remediate, export)
- Visual differentiation:
  - Node colors by type (red=vuln, purple=package, blue=project, etc.)
  - Node borders by severity/risk (red=critical, orange=high, etc.)
  - Edge styles by relationship (dashed=transitive, solid=direct)
  - Environment opacity (production=solid, dev=transparent)

**Predefined Queries Panel**
- One-click queries for common use cases:
  - "Log4Shell Blast Radius" → CVE-2021-44228 affected services
  - "Exposed Secrets to Production" → secrets with cloud resource access
  - "GPL License Violations" → copyleft in proprietary code
  - "Code-to-Cloud Attack Paths" → source issue → cloud resource
- Custom query builder (visual or Cypher DSL)

**Security Insights Dashboard**
- Summary cards: Critical Issues, High Issues, Total Assets, Auto-Fixable
- Multi-agent findings synthesis
- Risk trends over time (line charts)
- Top affected projects/teams (bar charts)

**EVO Assets View**
- Asset inventory table (filterable by environment, owner, risk)
- Security score per asset (0-100)
- Compliance status (SOC2, ISO27001, custom policies)
- Quick actions (scan now, export report, create ticket)

### 7.2 API for Agentic Automation

**GraphQL API** (preferred for flexibility)
```graphql
query BlastRadius {
  vulnerability(cve: "CVE-2021-44228") {
    affectedPackages {
      name
      version
      usedByProjects {
        name
        environment
        deployedServices {
          name
          accessesCloudResources {
            resourceType
            environment
          }
        }
      }
    }
  }
}
```

**Cypher-like DSL** (alternative, more expressive)
```cypher
MATCH path = (v:Vulnerability {cve: 'CVE-2021-44228'})-[:AFFECTS*1..10]->
             (svc:Service)-[:ACCESSES]->(cloud:CloudResource)
WHERE svc.environment = 'production' AND cloud.public_access = true
RETURN path, length(path) as hops
ORDER BY hops ASC
LIMIT 100
```

**REST API** (for simple queries)
```http
GET /api/v1/graph/vulnerability/CVE-2021-44228/blast-radius
  ?environment=production
  &max_hops=10
  &include_cloud_resources=true
```

### 7.3 CLI Tool (Developer Self-Service)

```bash
# Check if my PR introduces vulnerable dependencies
$ snyk graph check --pr 1234
✅ No new vulnerabilities in production path
⚠️  Found 2 medium-severity issues in dev dependencies

# Trace secret exposure
$ snyk graph trace secret --id aws-key-abc123
Secret found in: repo:acme-api, file:config.py
Used by service: acme-api-prod (production)
Accesses: RDS:prod-db, S3:customer-uploads
⚠️  CRITICAL: Rotate this key immediately!

# Get blast radius for CVE
$ snyk graph blast-radius CVE-2021-44228 --env production
Affected services: 12
  - payment-service (critical asset)
  - user-api (high traffic)
  - ...
Total production assets: 47
Auto-fix available: Yes (upgrade to log4j 2.17.1)
```

---

## 8. Rollout Strategy

### 8.1 Phase 1: Foundation (MVP - 3 months)

**Scope**: Basic graph for Snyk Open Source + Container
- **Data Sources**: Packages, vulnerabilities, container images, projects
- **Node Types**: Vulnerability, Package, ContainerImage, Project, Organization
- **Edge Types**: AFFECTS, DEPENDS_ON, USED_BY, OWNS
- **Queries**: Blast radius, dependency tree, vulnerability lookup
- **UI**: Read-only graph explorer, 5 predefined queries
- **API**: GraphQL endpoint (beta)
- **Users**: Internal pilot with 5 AppSec teams

**Success Criteria**:
- <3 second response time for 10-hop queries
- 95% query accuracy vs. manual correlation
- 10+ daily active users
- 50+ graph queries per day

### 8.2 Phase 2: Code-to-Cloud (6 months)

**Scope**: Add Snyk Code, IaC, and EVO assets
- **New Data Sources**: Code issues, IaC scans, cloud resources, services
- **New Node Types**: CodeIssue, IaCFile, Service, CloudResource, Secret
- **New Edge Types**: DEPLOYED_TO, ACCESSES, RUNS_IN, FOUND_IN
- **Queries**: Code-to-cloud paths, secrets exposure, IaC misconfig propagation
- **UI**: Interactive graph editing, environment filters, side panel details
- **API**: Cypher DSL support, webhook subscriptions
- **Users**: GA release to all Snyk Enterprise customers

**Success Criteria**:
- 100+ daily active users
- 500+ graph queries per day
- 80% reduction in time to blast radius analysis (from hours to seconds)
- 5+ customer case studies

### 8.3 Phase 3: Agentic Automation (9 months)

**Scope**: AI agent orchestration layer
- **Agentic API**: Agent-optimized query patterns, multi-query batching
- **Agent SDK**: Python/TypeScript SDK for building custom agents
- **Pre-built Agents**: 
  - Remediation Agent (auto-PRs for fixable vulns)
  - Secrets Rotation Agent (auto-rotate exposed keys)
  - License Compliance Agent (flag GPL violations)
  - Supply Chain Policy Agent (enforce package allow/deny lists)
- **UI**: Agent activity dashboard, approval workflows
- **Users**: Security automation teams, DevSecOps engineers

**Success Criteria**:
- 50+ agents deployed across customer base
- 1000+ automated remediation PRs per week
- 90% reduction in MTTR for critical vulnerabilities
- 10+ customers building custom agents

### 8.4 Phase 4: Runtime Intelligence (12 months)

**Scope**: Runtime telemetry integration
- **New Data Sources**: APM data (Datadog, New Relic), SIEM logs, WAF events
- **New Node Types**: RuntimeEvent, Exploit, Anomaly
- **New Edge Types**: TRIGGERED_BY, EXPLOITED_BY
- **Queries**: Active exploit detection, threat hunting, incident investigation
- **UI**: Real-time graph updates, anomaly highlighting
- **Users**: SOC analysts, incident responders, threat hunters

**Success Criteria**:
- <1 minute time-to-detect for active exploits
- 95% reduction in false positive alerts (context-aware alerting)
- Integration with 3+ SIEM/SOAR platforms

---

## 9. Success Metrics

### 9.1 Product Metrics

**Adoption**:
- Daily Active Users (DAU)
- Weekly Active Organizations (WAO)
- Graph queries per user per week
- API calls per day
- Agent deployments

**Engagement**:
- Average session duration
- Queries per session
- Node click-through rate
- Custom queries created per user
- Export/share actions per week

**Business Impact**:
- Time to blast radius analysis (target: <30 seconds, from ~4 hours)
- False positive rate reduction (target: 80% reduction)
- Mean Time to Remediation (MTTR) improvement (target: 50% reduction)
- Security team efficiency gain (target: 5x more vulns triaged per week)

### 9.2 Technical Metrics

**Performance**:
- P50/P95/P99 query latency
- Query success rate (target: >99%)
- Data freshness lag (target: <5 minutes)
- Graph traversal depth (average hops per query)

**Scale**:
- Total nodes in graph
- Total edges in graph
- Largest organization (nodes/edges)
- Peak queries per second (QPS)

**Reliability**:
- API uptime (target: 99.9%)
- Query compilation error rate (target: <0.1%)
- Data inconsistency rate (target: <0.01%)

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

**Risk 1: Query Performance Degrades at Scale**
- **Impact**: Queries timeout for large orgs (1M+ nodes)
- **Mitigation**: 
  - Benchmark early with synthetic 10M-node graphs
  - Implement query cost estimation + per-user limits
  - Offer "async query" mode for large results (email when ready)

**Risk 2: Data Inconsistency Across Sources**
- **Impact**: Graph shows stale/incorrect relationships
- **Mitigation**: 
  - Timestamp all data with `last_updated_at`
  - UI shows data freshness per node
  - Periodic reconciliation jobs (compare graph vs. source)

**Risk 3: Schema Drift Breaks Queries**
- **Impact**: Source table schema changes, graph queries fail
- **Mitigation**: 
  - Schema versioning in `graph_schema.yaml`
  - Automated tests for schema compatibility
  - Graceful degradation (skip missing fields, don't fail query)

### 10.2 Product Risks

**Risk 4: Users Don't Understand Graph Queries**
- **Impact**: Low adoption, users stick with existing dashboards
- **Mitigation**: 
  - Default to pre-built queries (90% of use cases covered)
  - Visual query builder (no code required)
  - Extensive docs + video tutorials
  - In-app tooltips + guided tours

**Risk 5: Competitors (Wiz, Lacework) Already Have Graphs**
- **Impact**: "Why should I switch to Snyk?"
- **Mitigation**: 
  - **Zero-ETL is differentiator** (no data duplication, real-time freshness)
  - **Snyk native** (deeper integration with Snyk products)
  - **Agentic-first** (built for AI agents, not just humans)

### 10.3 Business Risks

**Risk 6: Adds Significant Cost to Snyk Infrastructure**
- **Impact**: Graph queries increase DB load, slow down other services
- **Mitigation**: 
  - Read replicas for graph queries (isolate from OLTP writes)
  - Query result caching (reduce redundant work)
  - Rate limiting per user/org (prevent abuse)

**Risk 7: Data Privacy / Compliance Concerns**
- **Impact**: Customers don't want Snyk to store/analyze their graph data
- **Mitigation**: 
  - **Zero-ETL = data stays in customer's control** (we only query, never store)
  - Offer on-prem deployment option (graph engine runs in customer VPC)
  - SOC2 Type II, GDPR compliance for hosted version

---

## 11. Open Questions

1. **Query Language**: GraphQL vs. Cypher DSL vs. custom language?
   - **Recommendation**: GraphQL for simplicity, Cypher for power users
   
2. **Access Control**: How granular should RBAC be on graph queries?
   - **Recommendation**: Node-level permissions (inherit from Snyk projects), edge-level too complex

3. **Real-Time Updates**: Should graph UI auto-refresh on new data?
   - **Recommendation**: Yes for dashboard views, manual refresh for query results

4. **Pricing**: Is Security Graph a separate SKU or included in Enterprise?
   - **Recommendation**: Included in Enterprise, API usage limits on lower tiers

5. **Multi-Tenant Isolation**: How to prevent org A from querying org B's graph?
   - **Recommendation**: Query compiler injects `WHERE org_id = <user_org>` on all queries

---

## 12. Appendix

### 12.1 Competitive Analysis

| Vendor | Graph Approach | Strengths | Weaknesses |
|--------|----------------|-----------|------------|
| **Wiz** | Custom graph DB (Neo4j?) | Mature, fast, great UX | Requires ETL, data duplication, expensive |
| **Lacework** | Proprietary graph | Cloud-native, runtime integration | Closed ecosystem, no extensibility |
| **Datadog** | Service dependency graph | APM integration, real-time | Limited security context, no SAST/SCA |
| **Snyk (proposed)** | Zero-ETL graph | No duplication, real-time, agentic-native | New, unproven at scale |

### 12.2 Graph Query Examples

**Example 1: Find all production services affected by a CVE**
```cypher
MATCH (v:Vulnerability {cve: 'CVE-2021-44228'})-[:AFFECTS]->(p:Package)
      -[:USED_BY]->(proj:Project)-[:DEPLOYS_TO]->(svc:Service)
WHERE svc.environment = 'production'
RETURN svc.name, svc.owner_team, svc.deployment_time
ORDER BY svc.criticality DESC
```

**Example 2: Trace secret exposure to cloud resources**
```cypher
MATCH path = (sec:Secret)-[:FOUND_IN]->(repo:Repository)
             -[:DEPLOYS_TO]->(svc:Service)-[:ACCESSES]->(cloud:CloudResource)
WHERE sec.type = 'AWS_ACCESS_KEY' AND cloud.environment = 'production'
RETURN path, cloud.resource_type, cloud.public_access
```

**Example 3: Calculate composite risk score**
```cypher
MATCH (proj:Project)-[:HAS_ISSUE]->(issue)
OPTIONAL MATCH (issue)-[:VULNERABILITY]->(vuln:Vulnerability)
OPTIONAL MATCH (issue)-[:SECRET]->(secret:Secret)
WITH proj, 
     sum(CASE WHEN vuln.severity = 'critical' THEN 10 ELSE 0 END) as vuln_score,
     sum(CASE WHEN secret.type IS NOT NULL THEN 20 ELSE 0 END) as secret_score
RETURN proj.name, (vuln_score + secret_score) as total_risk
ORDER BY total_risk DESC
```

### 12.3 References

- **PuppyGraph**: Zero-ETL graph analytics engine (inspiration for architecture)
- **Neo4j Cypher**: Graph query language (syntax reference)
- **Wiz Security Graph**: Competitive benchmark for UX
- **EVO Architecture**: Internal docs for asset data model
- **Snyk Issues Strategy**: Unified issues API (integration point)

---

**End of PRD**

---

## Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | Maor Kuriel | 2026-06-09 | ✓ |
| Engineering Lead | TBD | | |
| Security Architect | TBD | | |
| VP Product | TBD | | |
| VP Engineering | TBD | | |

**Next Steps**:
1. Review with stakeholders (Security, Engineering, Product)
2. Validate technical feasibility with PoC (already built: snyk-security-graph-demo)
3. Get executive approval for Phase 1 roadmap
4. Allocate engineering resources (2 backend, 1 frontend, 1 data engineer)
5. Kick off Phase 1 sprint planning
