#!/usr/bin/env python3
"""
Generate realistic mock Snyk data for graph demo.

Generates:
- 100 organizations
- 5,000 projects
- 2,000 repositories
- 10,000 packages (npm, maven, pypi, docker)
- 50,000 package dependencies (creates realistic dependency graphs)
- 1,500 vulnerabilities (CVEs)
- 8,000 vulnerability-package mappings
- 15,000 issues (vuln, license, secret, container)
- 500 secrets
- 200 licenses
- 1,000 services
- 2,000 cloud resources
- 500 container images

Designed to demonstrate billion-scale graph performance when extrapolated.
"""

import uuid
import random
import string
from datetime import datetime, timedelta
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import execute_values
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)


class SnykMockDataGenerator:
    """Generates realistic Snyk security data"""

    # Realistic package ecosystems and names
    NPM_PACKAGES = [
        "lodash", "express", "react", "axios", "webpack", "babel-core",
        "eslint", "typescript", "jest", "commander", "chalk", "moment",
        "async", "request", "underscore", "debug", "yargs", "glob"
    ]

    MAVEN_PACKAGES = [
        "log4j-core", "spring-core", "hibernate-core", "jackson-databind",
        "commons-io", "guava", "slf4j-api", "junit", "mockito-core"
    ]

    PYPI_PACKAGES = [
        "requests", "django", "flask", "numpy", "pandas", "pytest",
        "boto3", "sqlalchemy", "pyyaml", "jinja2", "pillow"
    ]

    CVE_TEMPLATES = [
        "CVE-2021-44228",  # Log4Shell
        "CVE-2022-22965",  # Spring4Shell
        "CVE-2021-3129",   # Laravel RCE
        "CVE-2022-24288",  # Apache HTTP Server
        "CVE-2021-44832",  # Log4j JNDI
    ]

    SECRET_TYPES = [
        "AWS_ACCESS_KEY", "GITHUB_TOKEN", "SLACK_WEBHOOK", "STRIPE_API_KEY",
        "GOOGLE_API_KEY", "NPM_TOKEN", "DOCKER_HUB_TOKEN", "SSH_PRIVATE_KEY"
    ]

    LICENSE_CATEGORIES = {
        "MIT": ("permissive", "low", True),
        "Apache-2.0": ("permissive", "low", True),
        "BSD-3-Clause": ("permissive", "low", True),
        "GPL-2.0": ("copyleft", "high", True),
        "GPL-3.0": ("copyleft", "high", True),
        "AGPL-3.0": ("copyleft", "high", True),
        "LGPL-2.1": ("copyleft", "medium", True),
        "Proprietary": ("proprietary", "low", False),
        "Unlicense": ("public-domain", "low", True),
    }

    def __init__(self, db_url: str):
        """Initialize generator with database connection"""
        self.conn = psycopg2.connect(db_url)
        self.cursor = self.conn.cursor()

        # Storage for generated IDs to create relationships
        self.org_ids = []
        self.project_ids = []
        self.repo_ids = []
        self.package_ids = []
        self.vuln_ids = []
        self.license_ids = []
        self.secret_ids = []
        self.service_ids = []
        self.cloud_resource_ids = []
        self.container_image_ids = []

    def generate_all(self):
        """Generate complete mock dataset"""
        print("🏢 Generating organizations...")
        self.generate_organizations(100)

        print("📦 Generating licenses...")
        self.generate_licenses()

        print("📚 Generating packages...")
        self.generate_packages(10000)

        print("🔗 Generating package dependencies...")
        self.generate_package_dependencies(50000)

        print("📁 Generating repositories...")
        self.generate_repositories(2000)

        print("🚀 Generating projects...")
        self.generate_projects(5000)

        print("🔒 Generating vulnerabilities...")
        self.generate_vulnerabilities(1500)

        print("⚠️  Generating issues...")
        self.generate_issues(15000)

        print("🔑 Generating secrets...")
        self.generate_secrets(500)

        print("🌐 Generating services...")
        self.generate_services(1000)

        print("☁️  Generating cloud resources...")
        self.generate_cloud_resources(2000)

        print("🐳 Generating container images...")
        self.generate_container_images(500)

        self.conn.commit()
        print("✅ Mock data generation complete!")

    def generate_organizations(self, count: int):
        """Generate organizations"""
        orgs = []
        plan_types = ["free", "team", "business", "enterprise"]

        for _ in range(count):
            org_id = str(uuid.uuid4())
            company_name = fake.company()
            slug = company_name.lower().replace(' ', '-').replace(',', '')

            orgs.append((
                org_id,
                company_name,
                slug,
                random.choice(plan_types),
                datetime.now() - timedelta(days=random.randint(30, 730))
            ))
            self.org_ids.append(org_id)

        execute_values(
            self.cursor,
            "INSERT INTO organizations (id, name, slug, plan_type, created_at) VALUES %s",
            orgs
        )
        print(f"   Created {count} organizations")

    def generate_licenses(self):
        """Generate license records"""
        licenses = []
        for name, (category, risk, osi) in self.LICENSE_CATEGORIES.items():
            license_id = str(uuid.uuid4())
            licenses.append((
                license_id,
                name,
                name,  # SPDX ID
                category,
                risk,
                osi
            ))
            self.license_ids.append(license_id)

        execute_values(
            self.cursor,
            """INSERT INTO licenses
               (id, name, spdx_id, category, risk_level, osi_approved)
               VALUES %s""",
            licenses
        )
        print(f"   Created {len(licenses)} licenses")

    def generate_packages(self, count: int):
        """Generate packages across ecosystems"""
        packages = []
        ecosystems = {
            "npm": self.NPM_PACKAGES,
            "maven": self.MAVEN_PACKAGES,
            "pypi": self.PYPI_PACKAGES
        }

        for _ in range(count):
            pkg_id = str(uuid.uuid4())
            ecosystem = random.choice(list(ecosystems.keys()))
            base_name = random.choice(ecosystems[ecosystem])

            # Add variations
            if random.random() < 0.3:
                name = f"{base_name}-{fake.word()}"
            else:
                name = base_name

            version = f"{random.randint(0, 5)}.{random.randint(0, 20)}.{random.randint(0, 50)}"
            license_id = random.choice(self.license_ids)

            packages.append((
                pkg_id,
                name,
                version,
                ecosystem,
                license_id,
                f"pkg:{ecosystem}/{name}@{version}"
            ))
            self.package_ids.append(pkg_id)

        execute_values(
            self.cursor,
            """INSERT INTO packages
               (id, name, version, ecosystem, license_id, package_url)
               VALUES %s""",
            packages
        )
        print(f"   Created {count} packages")

    def generate_package_dependencies(self, count: int):
        """Generate realistic dependency graph"""
        dependencies = []
        dep_types = ["direct", "transitive"]
        scopes = ["runtime", "dev", "optional"]

        for _ in range(count):
            parent = random.choice(self.package_ids)
            child = random.choice(self.package_ids)

            if parent != child:  # No self-dependencies
                dependencies.append((
                    parent,
                    child,
                    random.choice(dep_types),
                    random.choice(scopes),
                    f"^{random.randint(1, 5)}.0.0"
                ))

        execute_values(
            self.cursor,
            """INSERT INTO package_dependencies
               (parent_package_id, child_package_id, dependency_type, scope, version_constraint)
               VALUES %s
               ON CONFLICT DO NOTHING""",
            dependencies
        )
        print(f"   Created {len(dependencies)} package dependencies")

    def generate_repositories(self, count: int):
        """Generate git repositories"""
        repos = []

        for _ in range(count):
            repo_id = str(uuid.uuid4())
            org_id = random.choice(self.org_ids)
            org_name = fake.company().lower().replace(' ', '-')
            repo_name = fake.word() + "-" + random.choice(["api", "service", "app", "lib"])

            repos.append((
                repo_id,
                org_id,
                repo_name,
                f"{org_name}/{repo_name}",
                f"https://github.com/{org_name}/{repo_name}",
                "main",
                random.choice([True, False])
            ))
            self.repo_ids.append(repo_id)

        execute_values(
            self.cursor,
            """INSERT INTO repositories
               (id, organization_id, name, full_name, url, default_branch, is_private)
               VALUES %s""",
            repos
        )
        print(f"   Created {count} repositories")

    def generate_projects(self, count: int):
        """Generate Snyk projects"""
        projects = []
        origins = ["github", "gitlab", "cli", "api"]
        project_types = ["npm", "maven", "pip", "docker", "k8s", "terraform"]

        for _ in range(count):
            proj_id = str(uuid.uuid4())
            org_id = random.choice(self.org_ids)

            projects.append((
                proj_id,
                org_id,
                f"{fake.word()}-{random.choice(['frontend', 'backend', 'service'])}",
                random.choice(origins),
                random.choice(project_types),
                "main",
                random.choice([True, False])
            ))
            self.project_ids.append(proj_id)

        execute_values(
            self.cursor,
            """INSERT INTO projects
               (id, organization_id, name, origin, project_type, branch, is_monitored)
               VALUES %s""",
            projects
        )

        # Link projects to repos
        proj_repos = [
            (random.choice(self.project_ids), random.choice(self.repo_ids))
            for _ in range(count)
        ]
        execute_values(
            self.cursor,
            "INSERT INTO project_repositories (project_id, repository_id) VALUES %s ON CONFLICT DO NOTHING",
            proj_repos
        )

        # Link projects to packages
        proj_packages = []
        for proj_id in self.project_ids[:1000]:  # Sample for performance
            num_packages = random.randint(5, 30)
            for _ in range(num_packages):
                proj_packages.append((
                    proj_id,
                    random.choice(self.package_ids),
                    random.choice([True, False]),
                    None
                ))

        execute_values(
            self.cursor,
            """INSERT INTO project_packages
               (project_id, package_id, is_direct, introduced_by)
               VALUES %s
               ON CONFLICT DO NOTHING""",
            proj_packages
        )

        print(f"   Created {count} projects with dependencies")

    def generate_vulnerabilities(self, count: int):
        """Generate vulnerabilities"""
        vulns = []
        severities = ["critical", "high", "medium", "low"]
        exploit_maturities = ["mature", "proof-of-concept", "no-known-exploit"]

        for i in range(count):
            vuln_id = str(uuid.uuid4())
            year = random.randint(2019, 2024)
            cve_num = 10000 + i

            vulns.append((
                vuln_id,
                f"CVE-{year}-{cve_num}",
                f"SNYK-JS-{fake.word().upper()}-{random.randint(10000, 99999)}",
                fake.sentence(nb_words=8),
                random.choice(severities),
                round(random.uniform(4.0, 10.0), 1),
                random.choice(exploit_maturities),
                datetime.now() - timedelta(days=random.randint(1, 1000))
            ))
            self.vuln_ids.append(vuln_id)

        execute_values(
            self.cursor,
            """INSERT INTO vulnerabilities
               (id, cve_id, snyk_id, title, severity, cvss_score, exploit_maturity, published_at)
               VALUES %s""",
            vulns
        )

        # Link vulnerabilities to packages
        pkg_vulns = []
        for _ in range(count * 5):
            pkg_vulns.append((
                random.choice(self.vuln_ids),
                random.choice(self.package_ids),
                random.choice([True, False]),
                f"{random.randint(1, 5)}.{random.randint(0, 10)}.0" if random.random() < 0.7 else None
            ))

        execute_values(
            self.cursor,
            """INSERT INTO package_vulnerabilities
               (vulnerability_id, package_id, is_fixable, fixed_in_version)
               VALUES %s
               ON CONFLICT DO NOTHING""",
            pkg_vulns
        )

        print(f"   Created {count} vulnerabilities")

    def generate_issues(self, count: int):
        """Generate Snyk issues"""
        issues = []
        issue_types = ["vuln", "license", "secret", "code", "container"]
        severities = ["critical", "high", "medium", "low"]
        statuses = ["open", "open", "open", "ignored", "resolved"]  # Weighted toward open

        for _ in range(count):
            issue_id = str(uuid.uuid4())
            proj_id = random.choice(self.project_ids)
            issue_type = random.choice(issue_types)
            severity = random.choice(severities)

            issues.append((
                issue_id,
                proj_id,
                issue_type,
                severity,
                fake.sentence(nb_words=6),
                random.choice(statuses),
                random.randint(0, 1000),
                datetime.now() - timedelta(days=random.randint(1, 365))
            ))

        execute_values(
            self.cursor,
            """INSERT INTO issues
               (id, project_id, issue_type, severity, title, status, priority_score, introduced_date)
               VALUES %s""",
            issues
        )
        print(f"   Created {count} issues")

    def generate_secrets(self, count: int):
        """Generate exposed secrets"""
        secrets = []

        for _ in range(count):
            secret_id = str(uuid.uuid4())
            secret_type = random.choice(self.SECRET_TYPES)

            secrets.append((
                secret_id,
                secret_type,
                ''.join(random.choices(string.hexdigits, k=64)),
                random.choice(["active", "rotated", "revoked"]),
                random.choice(["critical", "high", "medium"]),
                random.randint(1, 500),
                datetime.now() - timedelta(days=random.randint(1, 100))
            ))
            self.secret_ids.append(secret_id)

        execute_values(
            self.cursor,
            """INSERT INTO secrets
               (id, secret_type, fingerprint, status, severity, age_days, last_seen_at)
               VALUES %s""",
            secrets
        )

        # Link secrets to repositories
        repo_secrets = [
            (
                random.choice(self.secret_ids),
                random.choice(self.repo_ids),
                f"config/{fake.file_name()}",
                random.randint(1, 500),
                ''.join(random.choices(string.hexdigits, k=40)),
                fake.email()
            )
            for _ in range(count * 2)
        ]

        execute_values(
            self.cursor,
            """INSERT INTO repository_secrets
               (secret_id, repository_id, file_path, line_number, commit_sha, author_email)
               VALUES %s
               ON CONFLICT DO NOTHING""",
            repo_secrets
        )

        print(f"   Created {count} secrets")

    def generate_services(self, count: int):
        """Generate deployed services"""
        services = []
        service_types = ["web", "api", "worker", "function", "database"]
        environments = ["production", "staging", "development"]

        for _ in range(count):
            svc_id = str(uuid.uuid4())

            services.append((
                svc_id,
                random.choice(self.org_ids),
                f"{fake.word()}-{random.choice(service_types)}",
                random.choice(environments),
                random.choice(service_types)
            ))
            self.service_ids.append(svc_id)

        execute_values(
            self.cursor,
            """INSERT INTO services
               (id, organization_id, name, environment, service_type)
               VALUES %s""",
            services
        )

        # Link services to repos
        svc_deploys = [
            (random.choice(self.service_ids), random.choice(self.repo_ids))
            for _ in range(count)
        ]
        execute_values(
            self.cursor,
            """INSERT INTO service_deployments (service_id, repository_id)
               VALUES %s ON CONFLICT DO NOTHING""",
            svc_deploys
        )

        print(f"   Created {count} services")

    def generate_cloud_resources(self, count: int):
        """Generate cloud resources"""
        resources = []
        resource_types = ["ec2", "rds", "s3", "lambda", "dynamodb", "sqs"]
        environments = ["production", "staging", "development"]
        regions = ["us-east-1", "us-west-2", "eu-west-1"]

        for _ in range(count):
            res_id = str(uuid.uuid4())
            res_type = random.choice(resource_types)

            resources.append((
                res_id,
                random.choice(self.org_ids),
                f"arn:aws:{res_type}:us-east-1:123456789:{fake.word()}-{random.randint(1000,9999)}",
                res_type,
                random.choice(environments),
                random.choice(regions),
                '{}'
            ))
            self.cloud_resource_ids.append(res_id)

        execute_values(
            self.cursor,
            """INSERT INTO cloud_resources
               (id, organization_id, resource_arn, resource_type, environment, region, tags)
               VALUES %s""",
            resources
        )

        # Link services to cloud resources
        svc_cloud = [
            (
                random.choice(self.service_ids),
                random.choice(self.cloud_resource_ids),
                random.choice(["read", "write", "admin"])
            )
            for _ in range(count * 2)
        ]
        execute_values(
            self.cursor,
            """INSERT INTO service_cloud_access (service_id, cloud_resource_id, access_type)
               VALUES %s ON CONFLICT DO NOTHING""",
            svc_cloud
        )

        print(f"   Created {count} cloud resources")

    def generate_container_images(self, count: int):
        """Generate container images"""
        images = []
        registries = ["docker.io", "gcr.io", "ecr.aws"]
        base_images = ["node:18-alpine", "python:3.11-slim", "openjdk:17-jre"]

        for _ in range(count):
            img_id = str(uuid.uuid4())

            images.append((
                img_id,
                random.choice(self.org_ids),
                random.choice(registries),
                f"{fake.word()}/{fake.word()}",
                f"v{random.randint(1, 5)}.{random.randint(0, 20)}",
                ''.join(random.choices(string.hexdigits, k=64)),
                random.choice(base_images)
            ))
            self.container_image_ids.append(img_id)

        execute_values(
            self.cursor,
            """INSERT INTO container_images
               (id, organization_id, registry, repository, tag, digest, base_image)
               VALUES %s""",
            images
        )

        print(f"   Created {count} container images")

    def close(self):
        """Clean up database connection"""
        self.cursor.close()
        self.conn.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python generate_mock_data.py <postgres_connection_string>")
        print("Example: python generate_mock_data.py 'postgresql://user:pass@localhost/snyk_demo'")
        sys.exit(1)

    db_url = sys.argv[1]

    print("🚀 Starting Snyk mock data generation...")
    generator = SnykMockDataGenerator(db_url)

    try:
        generator.generate_all()
        print("\n✅ Data generation complete!")
        print(f"   Organizations: {len(generator.org_ids)}")
        print(f"   Projects: {len(generator.project_ids)}")
        print(f"   Packages: {len(generator.package_ids)}")
        print(f"   Vulnerabilities: {len(generator.vuln_ids)}")
    finally:
        generator.close()
