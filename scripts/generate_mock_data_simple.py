#!/usr/bin/env python3
"""
Simplified mock data generator using psycopg3
"""

import uuid
import random
from datetime import datetime, timedelta
from faker import Faker
import psycopg

fake = Faker()
Faker.seed(42)
random.seed(42)

DB_URL = "postgresql://snyk:demo_password_change_me@localhost:5432/snyk_demo"

def generate_data():
    """Generate simplified mock data"""
    print("🏢 Generating mock Snyk data...")

    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            # Generate organizations
            print("  Creating 20 organizations...")
            org_ids = []
            for i in range(20):
                org_id = str(uuid.uuid4())
                company = fake.company()
                slug = company.lower().replace(' ', '-').replace(',', '')[:50]
                cur.execute(
                    "INSERT INTO organizations (id, name, slug, plan_type) VALUES (%s, %s, %s, %s)",
                    (org_id, company, slug, random.choice(['free', 'team', 'business', 'enterprise']))
                )
                org_ids.append(org_id)

            # Generate licenses
            print("  Creating licenses...")
            licenses = {
                "MIT": ("permissive", "low", True),
                "Apache-2.0": ("permissive", "low", True),
                "GPL-3.0": ("copyleft", "high", True),
                "AGPL-3.0": ("copyleft", "high", True),
                "Proprietary": ("proprietary", "low", False),
            }
            license_ids = {}
            for name, (category, risk, osi) in licenses.items():
                lic_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO licenses (id, name, spdx_id, category, risk_level, osi_approved) VALUES (%s, %s, %s, %s, %s, %s)",
                    (lic_id, name, name, category, risk, osi)
                )
                license_ids[name] = lic_id

            conn.commit()

            # Generate packages
            print("  Creating 100 packages...")
            packages = ["lodash", "express", "react", "log4j-core", "spring-core", "django", "flask"]
            package_ids = []
            for i in range(100):
                pkg_id = str(uuid.uuid4())
                name = random.choice(packages)
                version = f"{random.randint(0,5)}.{random.randint(0,20)}.{random.randint(0,50)}"
                ecosystem = random.choice(['npm', 'maven', 'pypi'])
                license_id = random.choice(list(license_ids.values()))

                try:
                    cur.execute(
                        "INSERT INTO packages (id, name, version, ecosystem, license_id, package_url) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                        (pkg_id, name, version, ecosystem, license_id, f"pkg:{ecosystem}/{name}@{version}")
                    )
                    package_ids.append(pkg_id)
                except Exception as e:
                    conn.rollback()
                    print(f"    Warning: {e}")
                    continue

            conn.commit()

            # Generate package dependencies (creates graph structure)
            print("  Creating package dependencies...")
            for _ in range(200):
                parent = random.choice(package_ids)
                child = random.choice(package_ids)
                if parent != child:
                    try:
                        cur.execute(
                            "INSERT INTO package_dependencies (parent_package_id, child_package_id, dependency_type, scope) VALUES (%s, %s, %s, %s)",
                            (parent, child, random.choice(['direct', 'transitive']), random.choice(['runtime', 'dev']))
                        )
                    except:
                        pass  # Ignore duplicates

            # Generate vulnerabilities including Log4Shell
            print("  Creating vulnerabilities...")
            vuln_ids = []

            # Add Log4Shell
            log4shell_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO vulnerabilities (id, cve_id, snyk_id, title, severity, cvss_score, exploit_maturity, published_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (log4shell_id, "CVE-2021-44228", "SNYK-JAVA-ORGAPACHELOGGINGLOG4J-2314720",
                 "Remote code execution in Log4j", "critical", 10.0, "mature",
                 datetime(2021, 12, 10))
            )
            vuln_ids.append(log4shell_id)

            # Add more vulnerabilities
            for i in range(20):
                vuln_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO vulnerabilities (id, cve_id, snyk_id, title, severity, cvss_score, exploit_maturity, published_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                    (vuln_id, f"CVE-2022-{10000+i}", f"SNYK-{fake.word().upper()}-{random.randint(10000,99999)}",
                     fake.sentence(), random.choice(['critical', 'high', 'medium', 'low']),
                     round(random.uniform(4.0, 10.0), 1), random.choice(['mature', 'proof-of-concept', 'no-known-exploit']),
                     datetime.now() - timedelta(days=random.randint(1, 500)))
                )
                vuln_ids.append(vuln_id)

            # Link vulnerabilities to packages (especially Log4Shell to log4j)
            print("  Linking vulnerabilities to packages...")
            for pkg_id in package_ids:
                # 20% chance a package has a vulnerability
                if random.random() < 0.2:
                    vuln_id = random.choice(vuln_ids)
                    try:
                        cur.execute(
                            "INSERT INTO package_vulnerabilities (vulnerability_id, package_id, is_fixable, fixed_in_version) VALUES (%s, %s, %s, %s)",
                            (vuln_id, pkg_id, random.choice([True, False]),
                             f"{random.randint(1,5)}.0.0" if random.random() < 0.7 else None)
                        )
                    except:
                        pass

            # Link Log4Shell to log4j packages specifically
            for pkg_id in package_ids:
                cur.execute("SELECT name FROM packages WHERE id = %s", (pkg_id,))
                result = cur.fetchone()
                if result and 'log4j' in result[0].lower():
                    try:
                        cur.execute(
                            "INSERT INTO package_vulnerabilities (vulnerability_id, package_id, is_fixable, fixed_in_version) VALUES (%s, %s, %s, %s)",
                            (log4shell_id, pkg_id, True, "2.17.1")
                        )
                    except:
                        pass

            # Generate repositories
            print("  Creating repositories...")
            repo_ids = []
            for i in range(30):
                repo_id = str(uuid.uuid4())
                org_id = random.choice(org_ids)
                repo_name = f"{fake.word()}-{random.choice(['api', 'service', 'app'])}"

                cur.execute(
                    "INSERT INTO repositories (id, organization_id, name, full_name, url, default_branch, is_private) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (repo_id, org_id, repo_name, f"org/{repo_name}",
                     f"https://github.com/org/{repo_name}", "main", True)
                )
                repo_ids.append(repo_id)

            # Generate projects
            print("  Creating projects...")
            project_ids = []
            for i in range(50):
                proj_id = str(uuid.uuid4())
                org_id = random.choice(org_ids)

                cur.execute(
                    "INSERT INTO projects (id, organization_id, name, origin, project_type, branch, is_monitored) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (proj_id, org_id, f"{fake.word()}-project", random.choice(['github', 'cli']),
                     random.choice(['npm', 'maven', 'pip']), "main", True)
                )
                project_ids.append(proj_id)

                # Link project to repo
                try:
                    cur.execute(
                        "INSERT INTO project_repositories (project_id, repository_id) VALUES (%s, %s)",
                        (proj_id, random.choice(repo_ids))
                    )
                except:
                    pass

                # Link project to packages
                for _ in range(random.randint(3, 10)):
                    try:
                        cur.execute(
                            "INSERT INTO project_packages (project_id, package_id, is_direct) VALUES (%s, %s, %s)",
                            (proj_id, random.choice(package_ids), random.choice([True, False]))
                        )
                    except:
                        pass

            # Generate issues
            print("  Creating issues...")
            for proj_id in project_ids[:30]:  # Subset for performance
                for _ in range(random.randint(1, 5)):
                    issue_id = str(uuid.uuid4())
                    issue_type = random.choice(['vuln', 'license', 'secret'])

                    cur.execute(
                        "INSERT INTO issues (id, project_id, issue_type, severity, title, status, priority_score) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                        (issue_id, proj_id, issue_type, random.choice(['critical', 'high', 'medium', 'low']),
                         fake.sentence(), random.choice(['open', 'open', 'ignored']), random.randint(0, 1000))
                    )

            # Generate secrets
            print("  Creating secrets...")
            for _ in range(10):
                secret_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO secrets (id, secret_type, fingerprint, status, severity, age_days) VALUES (%s, %s, %s, %s, %s, %s)",
                    (secret_id, random.choice(['AWS_ACCESS_KEY', 'GITHUB_TOKEN', 'API_KEY']),
                     uuid.uuid4().hex, 'active', 'high', random.randint(1, 200))
                )

                # Link to repository
                try:
                    cur.execute(
                        "INSERT INTO repository_secrets (secret_id, repository_id, file_path, line_number, commit_sha) VALUES (%s, %s, %s, %s, %s)",
                        (secret_id, random.choice(repo_ids), f"config/{fake.file_name()}",
                         random.randint(1, 500), uuid.uuid4().hex[:40])
                    )
                except:
                    pass

            # Generate services
            print("  Creating services...")
            service_ids = []
            for _ in range(15):
                svc_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO services (id, organization_id, name, environment, service_type) VALUES (%s, %s, %s, %s, %s)",
                    (svc_id, random.choice(org_ids), f"{fake.word()}-service",
                     random.choice(['production', 'staging', 'development']),
                     random.choice(['web', 'api', 'worker']))
                )
                service_ids.append(svc_id)

                # Link to repository
                try:
                    cur.execute(
                        "INSERT INTO service_deployments (service_id, repository_id) VALUES (%s, %s)",
                        (svc_id, random.choice(repo_ids))
                    )
                except:
                    pass

            # Generate cloud resources
            print("  Creating cloud resources...")
            for _ in range(20):
                res_id = str(uuid.uuid4())
                res_type = random.choice(['ec2', 'rds', 's3', 'lambda'])
                cur.execute(
                    "INSERT INTO cloud_resources (id, organization_id, resource_arn, resource_type, environment, region, tags) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (res_id, random.choice(org_ids),
                     f"arn:aws:{res_type}:us-east-1:123456789:{fake.word()}-{random.randint(1000,9999)}",
                     res_type, random.choice(['production', 'staging']), 'us-east-1', '{}')
                )

                # Link service to cloud resource
                if service_ids:
                    try:
                        cur.execute(
                            "INSERT INTO service_cloud_access (service_id, cloud_resource_id, access_type) VALUES (%s, %s, %s)",
                            (random.choice(service_ids), res_id, random.choice(['read', 'write', 'admin']))
                        )
                    except:
                        pass

            conn.commit()
            print("✅ Mock data generation complete!")

            # Show stats
            cur.execute("SELECT COUNT(*) FROM organizations")
            print(f"   Organizations: {cur.fetchone()[0]}")
            cur.execute("SELECT COUNT(*) FROM projects")
            print(f"   Projects: {cur.fetchone()[0]}")
            cur.execute("SELECT COUNT(*) FROM packages")
            print(f"   Packages: {cur.fetchone()[0]}")
            cur.execute("SELECT COUNT(*) FROM package_dependencies")
            print(f"   Dependencies: {cur.fetchone()[0]}")
            cur.execute("SELECT COUNT(*) FROM vulnerabilities")
            print(f"   Vulnerabilities: {cur.fetchone()[0]}")

if __name__ == "__main__":
    generate_data()
