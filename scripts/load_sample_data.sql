-- Sample data for Snyk Security Graph Demo

-- Organizations
INSERT INTO organizations (id, name, slug, plan_type) VALUES
('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp', 'enterprise'),
('00000000-0000-0000-0000-000000000002', 'TechStart Inc', 'techstart-inc', 'business'),
('00000000-0000-0000-0000-000000000003', 'DevOps Solutions', 'devops-solutions', 'team');

-- Licenses
INSERT INTO licenses (id, name, spdx_id, category, risk_level, osi_approved) VALUES
('10000000-0000-0000-0000-000000000001', 'MIT', 'MIT', 'permissive', 'low', true),
('10000000-0000-0000-0000-000000000002', 'Apache-2.0', 'Apache-2.0', 'permissive', 'low', true),
('10000000-0000-0000-0000-000000000003', 'GPL-3.0', 'GPL-3.0', 'copyleft', 'high', true),
('10000000-0000-0000-0000-000000000004', 'AGPL-3.0', 'AGPL-3.0', 'copyleft', 'high', true),
('10000000-0000-0000-0000-000000000005', 'Proprietary', 'Proprietary', 'proprietary', 'low', false);

-- Packages
INSERT INTO packages (id, name, version, ecosystem, license_id, package_url) VALUES
('20000000-0000-0000-0000-000000000001', 'log4j-core', '2.14.1', 'maven', '10000000-0000-0000-0000-000000000002', 'pkg:maven/log4j-core@2.14.1'),
('20000000-0000-0000-0000-000000000002', 'spring-core', '5.3.9', 'maven', '10000000-0000-0000-0000-000000000002', 'pkg:maven/spring-core@5.3.9'),
('20000000-0000-0000-0000-000000000003', 'lodash', '4.17.19', 'npm', '10000000-0000-0000-0000-000000000001', 'pkg:npm/lodash@4.17.19'),
('20000000-0000-0000-0000-000000000004', 'express', '4.17.1', 'npm', '10000000-0000-0000-0000-000000000001', 'pkg:npm/express@4.17.1'),
('20000000-0000-0000-0000-000000000005', 'react', '17.0.2', 'npm', '10000000-0000-0000-0000-000000000001', 'pkg:npm/react@17.0.2'),
('20000000-0000-0000-0000-000000000006', 'axios', '0.21.1', 'npm', '10000000-0000-0000-0000-000000000001', 'pkg:npm/axios@0.21.1'),
('20000000-0000-0000-0000-000000000007', 'django', '3.2.0', 'pypi', '10000000-0000-0000-0000-000000000003', 'pkg:pypi/django@3.2.0'),
('20000000-0000-0000-0000-000000000008', 'flask', '2.0.1', 'pypi', '10000000-0000-0000-0000-000000000003', 'pkg:pypi/flask@2.0.1');

-- Package Dependencies (creates graph structure)
INSERT INTO package_dependencies (parent_package_id, child_package_id, dependency_type, scope) VALUES
('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'direct', 'runtime'),  -- spring depends on log4j
('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'direct', 'runtime'),  -- express depends on lodash
('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'direct', 'runtime'),  -- react depends on lodash
('20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'transitive', 'runtime'); -- axios transitively depends on lodash

-- Vulnerabilities
INSERT INTO vulnerabilities (id, cve_id, snyk_id, title, severity, cvss_score, exploit_maturity, published_at) VALUES
('30000000-0000-0000-0000-000000000001', 'CVE-2021-44228', 'SNYK-JAVA-ORGAPACHELOGGINGLOG4J-2314720', 'Remote code execution in Log4j', 'critical', 10.0, 'mature', '2021-12-10'),
('30000000-0000-0000-0000-000000000002', 'CVE-2021-23337', 'SNYK-JS-LODASH-1040724', 'Command injection in lodash', 'high', 7.2, 'proof-of-concept', '2021-02-15');

-- Link vulnerabilities to packages
INSERT INTO package_vulnerabilities (vulnerability_id, package_id, is_fixable, fixed_in_version) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', true, '2.17.1'),  -- Log4Shell affects log4j
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', true, '4.17.21'); -- lodash vuln

-- Repositories
INSERT INTO repositories (id, organization_id, name, full_name, url, default_branch, is_private) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'api-service', 'acme-corp/api-service', 'https://github.com/acme-corp/api-service', 'main', true),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'web-app', 'acme-corp/web-app', 'https://github.com/acme-corp/web-app', 'main', true),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'backend', 'techstart/backend', 'https://github.com/techstart/backend', 'main', true);

-- Projects
INSERT INTO projects (id, organization_id, name, origin, project_type, branch, is_monitored) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'acme-api', 'github', 'maven', 'main', true),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'acme-frontend', 'github', 'npm', 'main', true),
('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'techstart-api', 'github', 'maven', 'main', true),
('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'devops-dashboard', 'github', 'npm', 'main', true);

-- Link projects to repositories
INSERT INTO project_repositories (project_id, repository_id) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003');

-- Link projects to packages
INSERT INTO project_packages (project_id, package_id, is_direct) VALUES
-- Acme API uses spring (which depends on log4j)
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', true),
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', false),
-- Acme Frontend uses react and express (both depend on lodash)
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', true),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', true),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', false),
-- TechStart API uses log4j directly
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', true),
-- DevOps Dashboard uses express
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', true),
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', false);

-- Issues
INSERT INTO issues (id, project_id, issue_type, severity, title, status, priority_score, introduced_date) VALUES
('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'vuln', 'critical', 'Log4Shell RCE vulnerability', 'open', 980, '2021-12-10'),
('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'vuln', 'high', 'Command injection in lodash', 'open', 750, '2021-03-01'),
('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'vuln', 'critical', 'Log4Shell RCE vulnerability', 'open', 990, '2021-12-10');

-- Link issues to vulnerabilities
INSERT INTO issue_vulnerabilities (issue_id, vulnerability_id, package_id) VALUES
('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'),
('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001');

-- Services
INSERT INTO services (id, organization_id, name, environment, service_type) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'acme-api-prod', 'production', 'api'),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'acme-web-prod', 'production', 'web');

-- Link services to repositories
INSERT INTO service_deployments (service_id, repository_id) VALUES
('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002');

-- Cloud Resources
INSERT INTO cloud_resources (id, organization_id, resource_arn, resource_type, environment, region, tags) VALUES
('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'arn:aws:rds:us-east-1:123456789:db/prod-db', 'rds', 'production', 'us-east-1', '{}'),
('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'arn:aws:s3:::acme-prod-data', 's3', 'production', 'us-east-1', '{}');

-- Link services to cloud resources
INSERT INTO service_cloud_access (service_id, cloud_resource_id, access_type) VALUES
('70000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'write'),
('70000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'write');

-- Secrets
INSERT INTO secrets (id, secret_type, fingerprint, status, severity, age_days, last_seen_at) VALUES
('90000000-0000-0000-0000-000000000001', 'AWS_ACCESS_KEY', 'AKIAIOSFODNN7EXAMPLE-hash', 'active', 'critical', 45, NOW());

-- Link secrets to repositories
INSERT INTO repository_secrets (secret_id, repository_id, file_path, line_number, commit_sha, author_email) VALUES
('90000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'config/aws-config.yml', 12, 'abc123def456', 'dev@acme.com');
