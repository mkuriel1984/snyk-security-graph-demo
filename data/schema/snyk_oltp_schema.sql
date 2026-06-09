-- Snyk OLTP Schema (Postgres)
-- Represents operational data from Snyk platform

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan_type VARCHAR(50), -- free, team, business, enterprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_slug ON organizations(slug);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(500) NOT NULL,
    origin VARCHAR(100), -- github, gitlab, bitbucket, cli, api
    project_type VARCHAR(50), -- npm, maven, pip, docker, k8s, terraform
    branch VARCHAR(255),
    is_monitored BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_org ON projects(organization_id);
CREATE INDEX idx_project_type ON projects(project_type);

-- Repositories
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(500) NOT NULL,
    full_name VARCHAR(500) NOT NULL, -- org/repo format
    url VARCHAR(1000),
    default_branch VARCHAR(255),
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_repo_org ON repositories(organization_id);
CREATE INDEX idx_repo_full_name ON repositories(full_name);

-- Link projects to repositories
CREATE TABLE project_repositories (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, repository_id)
);

-- Packages (dependencies)
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    version VARCHAR(100) NOT NULL,
    ecosystem VARCHAR(50) NOT NULL, -- npm, maven, pypi, rubygems, nuget
    license_id UUID, -- FK added later
    package_url VARCHAR(1000), -- PURL format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, version, ecosystem)
);

CREATE INDEX idx_package_name ON packages(name);
CREATE INDEX idx_package_ecosystem ON packages(ecosystem);

-- Package Dependencies (dependency graph edges)
CREATE TABLE package_dependencies (
    parent_package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    child_package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50), -- direct, transitive
    scope VARCHAR(50), -- runtime, dev, optional
    version_constraint VARCHAR(100),
    PRIMARY KEY (parent_package_id, child_package_id)
);

CREATE INDEX idx_dep_parent ON package_dependencies(parent_package_id);
CREATE INDEX idx_dep_child ON package_dependencies(child_package_id);

-- Project uses Packages
CREATE TABLE project_packages (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    is_direct BOOLEAN DEFAULT true,
    introduced_by UUID REFERENCES packages(id), -- which direct dep brought this in
    PRIMARY KEY (project_id, package_id)
);

CREATE INDEX idx_proj_pkg_project ON project_packages(project_id);
CREATE INDEX idx_proj_pkg_package ON project_packages(package_id);

-- Vulnerabilities
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cve_id VARCHAR(50), -- CVE-2021-44228
    snyk_id VARCHAR(100) UNIQUE NOT NULL, -- SNYK-JS-LODASH-12345
    title VARCHAR(1000) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
    cvss_score DECIMAL(3,1),
    exploit_maturity VARCHAR(50), -- mature, proof-of-concept, no-known-exploit
    published_at TIMESTAMP,
    disclosed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vuln_cve ON vulnerabilities(cve_id);
CREATE INDEX idx_vuln_snyk ON vulnerabilities(snyk_id);
CREATE INDEX idx_vuln_severity ON vulnerabilities(severity);

-- Vulnerabilities affect Packages
CREATE TABLE package_vulnerabilities (
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    is_fixable BOOLEAN DEFAULT false,
    fixed_in_version VARCHAR(100),
    PRIMARY KEY (vulnerability_id, package_id)
);

CREATE INDEX idx_pkg_vuln_vuln ON package_vulnerabilities(vulnerability_id);
CREATE INDEX idx_pkg_vuln_pkg ON package_vulnerabilities(package_id);

-- Issues (Snyk-detected problems in projects)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL, -- vuln, license, secret, code, container, iac
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, ignored, resolved, fixed
    priority_score INTEGER, -- Snyk priority score 0-1000
    introduced_date TIMESTAMP,
    resolved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_project ON issues(project_id);
CREATE INDEX idx_issue_type ON issues(issue_type);
CREATE INDEX idx_issue_status ON issues(status);

-- Link Issues to Vulnerabilities
CREATE TABLE issue_vulnerabilities (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, vulnerability_id, package_id)
);

-- Licenses
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- MIT, GPL-3.0, Apache-2.0
    spdx_id VARCHAR(100),
    category VARCHAR(50), -- permissive, copyleft, proprietary, public-domain
    risk_level VARCHAR(20), -- low, medium, high
    osi_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_license_name ON licenses(name);
CREATE INDEX idx_license_category ON licenses(category);

-- Add FK to packages
ALTER TABLE packages ADD CONSTRAINT fk_package_license
    FOREIGN KEY (license_id) REFERENCES licenses(id);

-- License Issues
CREATE TABLE issue_licenses (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    violation_reason TEXT,
    PRIMARY KEY (issue_id, license_id, package_id)
);

-- Secrets
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_type VARCHAR(100) NOT NULL, -- aws_access_key, github_token, api_key
    fingerprint VARCHAR(255) UNIQUE NOT NULL, -- hash of secret value
    status VARCHAR(50) DEFAULT 'active', -- active, rotated, revoked
    severity VARCHAR(20) DEFAULT 'high',
    age_days INTEGER,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_secret_type ON secrets(secret_type);
CREATE INDEX idx_secret_status ON secrets(status);

-- Secrets found in Repositories
CREATE TABLE repository_secrets (
    secret_id UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path VARCHAR(1000),
    line_number INTEGER,
    commit_sha VARCHAR(100),
    author_email VARCHAR(255),
    PRIMARY KEY (secret_id, repository_id)
);

CREATE INDEX idx_repo_secret_repo ON repository_secrets(repository_id);
CREATE INDEX idx_repo_secret_secret ON repository_secrets(secret_id);

-- Secret Issues
CREATE TABLE issue_secrets (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    secret_id UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, secret_id)
);

-- Services (deployed applications)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(500) NOT NULL,
    environment VARCHAR(50), -- production, staging, development
    service_type VARCHAR(100), -- web, api, worker, function
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_org ON services(organization_id);
CREATE INDEX idx_service_env ON services(environment);

-- Services deploy from Repositories
CREATE TABLE service_deployments (
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (service_id, repository_id)
);

-- Cloud Resources
CREATE TABLE cloud_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    resource_arn VARCHAR(500) UNIQUE NOT NULL,
    resource_type VARCHAR(100), -- ec2, rds, s3, lambda, etc
    environment VARCHAR(50),
    region VARCHAR(50),
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cloud_org ON cloud_resources(organization_id);
CREATE INDEX idx_cloud_type ON cloud_resources(resource_type);
CREATE INDEX idx_cloud_env ON cloud_resources(environment);

-- Services access Cloud Resources
CREATE TABLE service_cloud_access (
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    cloud_resource_id UUID NOT NULL REFERENCES cloud_resources(id) ON DELETE CASCADE,
    access_type VARCHAR(50), -- read, write, admin
    PRIMARY KEY (service_id, cloud_resource_id)
);

-- Container Images
CREATE TABLE container_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    registry VARCHAR(255),
    repository VARCHAR(255),
    tag VARCHAR(255),
    digest VARCHAR(100),
    base_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registry, repository, tag, digest)
);

CREATE INDEX idx_container_org ON container_images(organization_id);
CREATE INDEX idx_container_repo ON container_images(repository);

-- Container Issues
CREATE TABLE issue_containers (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    container_image_id UUID NOT NULL REFERENCES container_images(id) ON DELETE CASCADE,
    vulnerability_id UUID REFERENCES vulnerabilities(id),
    layer_id VARCHAR(100),
    PRIMARY KEY (issue_id, container_image_id)
);

-- Services run Container Images
CREATE TABLE service_containers (
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    container_image_id UUID NOT NULL REFERENCES container_images(id) ON DELETE CASCADE,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (service_id, container_image_id)
);

-- Create composite indexes for graph traversals
CREATE INDEX idx_graph_vuln_package ON package_vulnerabilities(vulnerability_id, package_id);
CREATE INDEX idx_graph_package_project ON project_packages(package_id, project_id);
CREATE INDEX idx_graph_project_org ON projects(id, organization_id);
CREATE INDEX idx_graph_dep_chain ON package_dependencies(parent_package_id, child_package_id);
CREATE INDEX idx_graph_secret_repo ON repository_secrets(secret_id, repository_id);
CREATE INDEX idx_graph_repo_service ON service_deployments(repository_id, service_id);
CREATE INDEX idx_graph_service_cloud ON service_cloud_access(service_id, cloud_resource_id);
