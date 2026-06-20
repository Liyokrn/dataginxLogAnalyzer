🏗️ LogAnalyzer: Architecture & Infrastructure Topology Plan

1. Security & Configuration Strategy (Zero-Trust)

GitHub Policy: Absolute prohibition of hardcoding credentials, IPs, or secrets in the repository. Ensure strict .gitignore rules for .env, *.pem, *.key, and kubeconfig files.

Environment Variables: All environments will be managed via .env files. The backend must implement a configuration loader/validator at startup (e.g., using zod or joi) to ensure all required secrets exist before booting.

VPN Networking (The Bridge): Target servers are behind strict Firewalls and WAFs. The LogAnalyzer backend will communicate with a designated gateway machine running the corporate VPN. Tailscale will be used to establish a secure overlay mesh network. Agents on the target servers will send data only through this Tailscale IP, simulating a secure LAN.

2. Infrastructure Topology: "Proyecto X" (Phase 1 Target)

The system must handle this specific topology while ensuring the database schema uses a generic project_id and environment_id to scale. Future Kubernetes (K8s) indexing must be accounted for in the data model (cluster_id, pod_id).

A. Shared Services (Hosted in QA Network, serving QA & PROD)

Node S1 (GitLab): Handles auto-deployments. Needs OS metrics and GitLab logs.

Node S2 (SonarQube & Runners): Ubuntu Server running Docker.

Requirements: Host OS metrics (CPU/RAM/Disk), Docker daemon metrics, persistent SonarQube container logs, and temporary .NET analyzer container logs and metrics.

B. QA Environment

Nodes Q1, Q2 (Linux Web Servers):

Target Logs: Nginx access/error logs, PHP-FPM logs, PHP Slow logs.

Target Metrics: Host OS resources.

Node Q3 (Cache Server): Ubuntu Server running Docker (Redis).

Requirements: Host OS metrics, Docker container metrics, Redis logs.

Nodes Q4, Q5 (Windows Servers):

Target Logs: .NET Application logs, Windows Event Logs.

Target Metrics: Windows host resources.

C. PROD Environment

Nodes P1, P2, P3 (Linux Web Servers):

Target Logs: Nginx, PHP-FPM, PHP Slow logs.

Target Metrics: Host OS resources.

Node P4 (Cache Server): Ubuntu Server running Docker (Redis).

Requirements: Host OS metrics, Docker container metrics, Redis logs.

Nodes P5, P6, P7 (Windows Servers):

Target Logs: .NET Application logs.

Target Metrics: Windows host resources.

3. Data Collection Strategy: The "Vector" Agent

We will strictly use Vector (by Datadog/OSS, written in Rust) as the universal unified agent across all nodes.

Agent Advantages & Deployment Strategy:

Unified Binary: Vector will handle both metric collection (Host CPU/RAM/Disk) and log routing.

Security: Rust's memory-safe architecture minimizes exploit vectors on our protected servers.

Docker Auto-Discovery: On nodes S2, Q3, and P4, Vector will mount /var/run/docker.sock. It will auto-detect short-lived SonarQube runner containers, extract their temporary logs, and gracefully detach when they die.

PHP-FPM Wildcard: Configured to read /var/log/php*-fpm.log to natively support multiple concurrent PHP versions without agent reboots.

Network Path: Vector will be configured with a sink pointing exclusively to the LogAnalyzer Backend's Tailscale IP address over a secure port (e.g., TCP 9000 or gRPC).

Crucial Static Tagging at Source:

EVERY log line and metric emitted MUST be statically tagged by Vector before traveling through the Tailscale VPN. Required base tags:

project="Proyecto X"

env="QA" | "PROD" | "SHARED"

os="linux" | "windows"

source_node="Q1" | "P5" | "S2"

service_type="nginx" | "php-fpm" | "redis" | "dotnet" | "sonarqube" | "gitlab"