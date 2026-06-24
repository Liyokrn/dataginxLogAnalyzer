🗄️ LogAnalyzer: Database Schema & ClickHouse Strategy

1. Core Database Engine: ClickHouse

ClickHouse is chosen for its columnar storage, massive ingestion capabilities, and vectorized query execution. It will act as the single source of truth for both logs and hardware metrics.

Network Placement: The ClickHouse server will reside within the secure Tailscale mesh VPN network. The LogAnalyzer Backend will communicate with it via HTTP/TCP interfaces on the Tailscale IP.

2. Table Schemas & Engines

We will utilize ClickHouse's MergeTree family of engines, which are heavily optimized for time-series and log data.

A. The Logs Table (logs_main)

This table stores all application and system logs. It handles both static tags (from Vector) and dynamically extracted fields (from the LogAnalyzer Pipeline Engine).

CREATE TABLE IF NOT EXISTS loganalyzer.logs_main
(
    -- 1. Temporal & Identification
    timestamp       DateTime64(3, 'UTC'),
    log_id          UUID DEFAULT generateUUIDv4(),
    
    -- 2. Static Infrastructure Tags (Injected by Vector)
    project_id      LowCardinality(String), -- e.g., 'proyecto_x'
    env             LowCardinality(String), -- 'QA', 'PROD', 'SHARED'
    os              LowCardinality(String), -- 'linux', 'windows'
    source_node     LowCardinality(String), -- 'Q1', 'P5'
    service_type    LowCardinality(String), -- 'nginx', 'php-fpm', 'dotnet'
    level           LowCardinality(String), -- 'INFO', 'WARN', 'ERROR', 'CRITICAL'
    
    -- 3. Dynamic Extracted Fields (From Visual Pipeline)
    extracted_module String,                -- e.g., 'nomina', 'auth'. Extracted via Regex.
    dynamic_labels   Map(String, String),   -- Stores other custom extracted key/value pairs
    
    -- 4. Raw Data
    message         String                  -- The actual log line
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp) -- Partitions data by month for easy lifecycle management
ORDER BY (project_id, env, service_type, extracted_module, timestamp) 
TTL timestamp + INTERVAL 30 DAY; -- Auto-delete logs older than 30 days (configurable)


Optimization Notes for Agent:

LowCardinality: Used for fields with a limited set of unique values (like env or level). This massively reduces RAM usage and speeds up WHERE clauses.

ORDER BY (Primary Key): The order is critical. (project_id, env, service_type, extracted_module, timestamp) means that when a user clicks on "Project X -> PROD -> Nginx -> Nomina", ClickHouse jumps directly to that data block without scanning the entire database.

Map(String, String): Allows the Pipeline engine to extract arbitrary variables without altering the table schema.

B. The Metrics Table (hardware_metrics)

Stores time-series data for the Dashboard (CPU, RAM, Network).

CREATE TABLE IF NOT EXISTS loganalyzer.hardware_metrics
(
    timestamp       DateTime,
    project_id      LowCardinality(String),
    env             LowCardinality(String),
    source_node     LowCardinality(String),
    metric_name     LowCardinality(String), -- 'cpu_percent', 'mem_used_bytes', 'net_rx_bytes'
    value           Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (project_id, env, source_node, metric_name, timestamp)
TTL timestamp + INTERVAL 15 DAY; -- Metrics can usually be rotated faster than logs


3. Data Flow Strategy (Vector -> Backend -> ClickHouse)

To support the dynamic "Pipeline Editor" where users create extraction rules from the UI:

Ingestion: Vector on target nodes (Q1, P5, etc.) collects raw logs, adds the static tags (env="QA", service_type="nginx"), and sends them to the LogAnalyzer Backend API via Tailscale.

Processing (Backend): The Backend receives the stream, checks the active Pipelines configured by the user, runs the Regex extractions in memory (e.g., mapping /var/www/nomina to extracted_module = 'nomina').

Insertion (ClickHouse): The Backend batches the processed logs and inserts them into ClickHouse in micro-batches (e.g., every 1 second or 10,000 rows) using the ClickHouse HTTP interface. Note: ClickHouse hates single-row inserts; batching is mandatory.