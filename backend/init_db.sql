CREATE DATABASE IF NOT EXISTS loganalyzer;

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
