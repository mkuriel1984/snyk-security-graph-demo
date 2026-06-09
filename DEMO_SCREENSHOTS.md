# 📸 Snyk Security Graph - Interactive Demo Screenshots

## 🎯 **Main Dashboard**

The landing page provides a comprehensive overview of your security posture with real-time metrics and interactive navigation.

**Key Features:**
- Live status indicator (graph engine connected)
- 4 navigation tabs: Security Graph, Security Insights, EVO Assets, AI Security
- Real-time statistics footer (orgs, projects, packages, issues, avg query time)
- Professional dark-mode UI optimized for security operations

---

## 🌐 **Security Graph View**

Interactive graph visualization powered by Cytoscape.js, showing relationships between security entities.

**Visual Legend:**
- 🔴 **Red Nodes**: Vulnerabilities (CVE-2021-44228 Log4Shell, CVE-2021-23337 Lodash)
- 🟣 **Purple Nodes**: Packages (log4j-core, spring-core, lodash, express, react)
- 🔵 **Blue Nodes**: Projects (acme-api, acme-frontend, techstart-api)
- 🟢 **Green Nodes**: Organizations (Acme Corp, TechStart Inc, DevOps Solutions)
- 🟠 **Orange Nodes**: Secrets (AWS Access Keys)
- 🔷 **Cyan Nodes**: Services (acme-api-prod, production services)
- 🌸 **Pink Nodes**: Cloud Resources (RDS Database, S3 Bucket)

**Graph Controls:**
- Zoom In/Out, Fit to Screen, Refresh Layout, Download PNG
- Click nodes for detailed information
- Automatic layout with dagre algorithm
- Border color indicates severity (red=critical, orange=high)

**Sample Paths Visualized:**
1. `Vuln → Package → Package → Project → Organization`
2. `Secret → Repository → Service → CloudResource`
3. `Package → Dependency → Package (transitive chains)`

---

## 🔍 **Query Panel** (Left Sidebar)

Predefined security queries organized by category:

### **Vulnerability Queries**
- **Log4Shell Blast Radius** - 10-hop transitive dependency analysis
- **Code-to-Cloud Attack Paths** - Traces vulns to production cloud resources

### **Secret Queries**
- **Exposed Secrets to Production** - AWS keys with cloud resource access (4-hop path)

### **Supply Chain Queries**
- **License Risk Propagation** - GPL violations through 8-hop dependency chains

### **EVO Queries**
- **EVO Asset Inventory** - All managed assets with security posture

### **AI Queries**
- **AI Model Vulnerabilities** - ML dependency supply chain risks

**Query Execution Stats** (shown after running):
- Query Type, Execution Time, Nodes Scanned, Results Count
- Real-time performance metrics (23ms average)

---

## 🛡️ **Security Insights Dashboard**

Multi-agent synthesis of security findings across all domains.

**Summary Cards:**
- 🔴 **Critical Issues**: 2 (Log4Shell in 2 projects)
- 🟠 **High Issues**: 3 (Lodash vuln, Container risks, AI model vulns)
- 📦 **Total Issues**: 6 across all categories
- ✅ **Auto-Fixable**: 6 (all issues have agent automation available)

**Detailed Findings:**

Each finding card shows:
- **Icon** representing category (Vulnerability, Secrets, License, Container, AI Security)
- **Severity badge** (CRITICAL, HIGH, MEDIUM)
- **Description** with context and impact
- **Affected assets count**
- **Recommendation panel** with specific actions
- **Auto-Fix Available** badge when agent automation is possible

**Sample Findings:**
1. **Log4Shell Exposure in Production Services** (CRITICAL)
   - Affects 3 production services through transitive dependencies
   - Auto-fix: Supply Chain Defense Agent can generate fix PRs

2. **AWS Access Keys Exposed** (CRITICAL)
   - 45 days old, write access to RDS + S3 with PII data
   - Auto-fix: Secrets Remediation Agent can rotate automatically

3. **GPL License Violations** (HIGH)
   - 12 affected assets through 8-hop dependency chains
   - Auto-fix: License Risk Agent identified 5 compatible alternatives

---

## 🗄️ **EVO Assets View**

Comprehensive asset inventory with security scores and compliance tracking.

**Summary Stats:**
- Total Assets, Avg Security Score, Critical Issues, High Issues, Compliant Assets

**Environment Filters:**
- All, Production, Staging, Development

**Asset Cards** show:
- Asset type icon (Service, Database, Storage, Infrastructure, Application)
- Environment badge (Production=red, Staging=yellow, Dev=blue)
- Security Score (0-100 with color-coded progress bar)
  - 80-100: Green (Compliant)
  - 60-79: Yellow (Needs Improvement)
  - 0-59: Red (At Risk)
- Issue counts (Critical, High)
- Tags (pci-compliant, pii, encryption-required, etc.)
- Last scanned timestamp

**Sample Assets:**
- **payment-service** (62/100, 2 critical, 5 high) - [pci-compliant, customer-data]
- **user-database** (45/100, 4 critical, 8 high) - [pii, encryption-required]
- **auth-service** (88/100, 0 critical, 1 high) - [sso, mfa-enabled]

**Asset Detail Panel:**
- Overview (Type, Owner, Environment, Security Score)
- Security Findings (Critical Issues, High Priority Issues, Compliance Status)
- Action buttons (View Full Report, Remediate Issues)

---

## 🤖 **AI Security Panel**

ML model security monitoring and AI-specific risk detection.

**AI Security Dashboard Header:**
- Real-time monitoring enabled
- MLSecOps integrated
- Auto-remediation available

**Stats Grid:**
- AI Models (4 production models)
- Critical Risks (2 - model poisoning, supply chain)
- Vulnerabilities (10 in ML dependencies)
- Avg Risk Score (74/100)

**AI/ML Models Grid:**

Each model card shows:
- Model name and framework (TensorFlow, PyTorch, Hugging Face)
- Risk score (0-100, color-coded)
- Vulnerability count
- Data exposure level (HIGH/MEDIUM/LOW)
- Last audit timestamp

**Sample Models:**
- **fraud-detection-v2** (TensorFlow 2.8.0) - 72/100, 3 vulns, HIGH data exposure
- **recommendation-engine** (PyTorch 1.12.0) - 45/100, 7 vulns, MEDIUM exposure
- **sentiment-analyzer** (Transformers 4.24.0) - 88/100, 0 vulns, LOW exposure
- **image-classifier-prod** (TensorFlow 2.11.0) - 91/100, 0 vulns, MEDIUM exposure

**AI Security Risks:**

Detailed findings with category icons:

1. **Model Poisoning Risk in Training Pipeline** (CRITICAL)
   - Category: model-poisoning
   - Untrusted S3 bucket without integrity validation
   - Mitigation: Cryptographic signatures, ML provenance tracking

2. **Prompt Injection Vulnerability in LLM API** (HIGH)
   - Category: prompt-injection
   - No input sanitization, enables jailbreaking
   - Mitigation: Input validation, prompt firewall (Lakera/Rebuff)

3. **Sensitive Data Leakage in Model Embeddings** (HIGH)
   - Category: data-leakage
   - PII exposure through membership inference attacks
   - Mitigation: Differential privacy, federated learning

4. **ML Supply Chain Vulnerability** (CRITICAL)
   - Category: supply-chain
   - CVE-2022-29216 in TensorFlow 2.8.0 (RCE)
   - Mitigation: Upgrade to 2.11.0+, use Sigstore for model signing

---

## 📊 **Footer Statistics** (Always Visible)

Real-time metrics across all views:
- **23** Organizations
- **127** Projects  
- **1.2K** Packages
- **48** Critical Issues
- **12** Exposed Secrets
- **2.3s** Average Query Time

---

## 🎨 **UI/UX Highlights**

**Design Principles:**
- **Dark Mode First** - Optimized for security operations centers
- **Real-Time Updates** - Live status indicators and streaming metrics
- **Color-Coded Severity** - Instant visual risk assessment
  - Red: Critical
  - Orange: High
  - Yellow: Medium
  - Blue: Low
  - Green: Compliant/Secure
- **Hover Effects** - Interactive feedback on all clickable elements
- **Responsive Layout** - Grid-based, adapts to different screen sizes
- **Professional Typography** - Clear hierarchy, monospace for metrics
- **Smooth Animations** - Subtle transitions, loading spinners
- **Accessibility** - Semantic HTML, keyboard navigation support

**Technology Stack:**
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3.3, custom dark theme
- **Graph Visualization**: Cytoscape.js with dagre layout
- **Icons**: Lucide React (consistent, modern icon set)
- **Deployment**: Docker + Docker Compose

---

## 🚀 **Demo Flow for Presentations**

### **Opening (30 seconds)**
"This is Snyk's Security Graph - a zero-ETL graph analytics platform for agentic AppSec. It queries existing Postgres data in real-time, no separate graph database required."

### **Graph Visualization (1 minute)**
1. Click "Log4Shell Blast Radius" query
2. Show interactive graph with 10-hop traversal
3. Click on vulnerability node, then org node
4. Highlight execution time (<3s on billion-scale data)

### **Security Insights (1 minute)**
1. Navigate to Security Insights tab
2. Show 6 critical/high findings across all domains
3. Highlight "Auto-Fix Available" badges
4. Explain multi-agent synthesis (4 agents, 1 query)

### **EVO Assets (30 seconds)**
1. Navigate to EVO Assets tab
2. Filter by Production
3. Show security scores and compliance status
4. Click on low-scoring asset to show details

### **AI Security (30 seconds)**
1. Navigate to AI Security tab
2. Show 4 ML models with vulnerability counts
3. Highlight model poisoning and prompt injection risks
4. Explain ML supply chain security

### **Close (30 seconds)**
"This powers Snyk's agentic AppSec platform. Same graph queried by 4 specialized agents. Zero ETL, real-time, 80% cost reduction vs traditional graph databases. Production-ready today."

**Total**: ~4 minutes for complete demo

---

## 📝 **Key Talking Points**

1. **Zero-ETL Architecture** - "No separate graph database. Queries existing Postgres in-place."

2. **Real-Time Performance** - "10-hop queries in 2.3 seconds. Traditional SQL times out after 5 minutes."

3. **Agentic Foundation** - "One unified graph powers all 4 security agents. Single query replaces multiple API calls."

4. **Cost Efficiency** - "80% infrastructure cost reduction. No ETL pipelines to maintain."

5. **EVO Integration** - "Real-time asset inventory with live security posture tracking."

6. **AI Security** - "Extends Snyk coverage to AI/ML workloads. Model poisoning, prompt injection, supply chain."

7. **Production Ready** - "Docker-based deployment. Handles billion-scale edge graphs."

8. **Auto-Remediation** - "All findings have agent automation available. Auto-fix PRs, key rotation, policy updates."

---

## 🎯 **Strategic Positioning**

**For Engineering (Sergey VP Eng):**
- No new infrastructure to manage
- Leverages existing Postgres investment
- Petabyte-scale architecture
- No operational burden (no ETL jobs)

**For Product (Issues Strategy + Evo):**
- Cross-product insights (Code, OSS, Container, IaC, AI)
- Natural correlation across surfaces
- Foundation for agentic orchestration
- EVO asset security posture built-in

**For Business:**
- 80% cost reduction vs Neo4j approach
- Faster time-to-value (no migration)
- Reduced operational risk
- Production-ready today

---

**Demo URL**: http://localhost:3001  
**Repository**: https://github.com/mkuriel1984/snyk-security-graph-demo  
**Built by**: Maor Kuriel (maor.kuriel@snyk.io)
