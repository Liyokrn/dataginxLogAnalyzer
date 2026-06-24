import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocketPlugin from '@fastify/websocket';
import * as dotenv from 'dotenv';
import { clickhouse, checkConnection } from './db';
import { pipelineProcessor } from './pipeline';
import { queryParser } from './QueryParser';

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, { 
  origin: true // In production, restrict this to the frontend URL
});

server.register(websocketPlugin);

// Keep track of active WebSocket connections
const connectedSockets = new Set<any>();

server.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    connectedSockets.add(socket);
    fastify.log.info('New WebSocket connection established.');

    socket.on('close', () => {
      connectedSockets.delete(socket);
      fastify.log.info('WebSocket connection closed.');
    });

    socket.on('error', (err: any) => {
      connectedSockets.delete(socket);
      fastify.log.error(err);
    });
  });
});

// Authentication middleware
server.addHook('onRequest', async (request, reply) => {
  // Allow health checks without auth
  if (request.url === '/health' || request.url === '/health/') {
    return;
  }

  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Handle WebSocket token authentication passed as query parameter
  const queryToken = (request.query as any)?.token;
  const activeToken = token || queryToken;

  if (request.url.startsWith('/api/ingest')) {
    const ingestKey = process.env.INGEST_API_KEY;
    if (!ingestKey || activeToken !== ingestKey) {
      return reply.code(401).send({ error: 'Unauthorized: Invalid or missing Ingest API Key' });
    }
  } else {
    const frontendKey = process.env.FRONTEND_API_KEY;
    if (!frontendKey || activeToken !== frontendKey) {
      return reply.code(401).send({ error: 'Unauthorized: Invalid or missing Frontend API Key' });
    }
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

server.post('/api/ingest', async (request, reply) => {
  try {
    const data: any = request.body;
    const events = Array.isArray(data) ? data : [data];

    if (events.length === 0) {
      return reply.code(200).send({ status: 'ignored', reason: 'empty payload' });
    }

    const logRows: any[] = [];
    const metricRows: any[] = [];

    for (const event of events) {
      // Ignore Vector metrics so they don't pollute logs_main as "unknown"
      if (event.name && (event.counter || event.gauge || event.kind)) {
        continue;
      }

      if (event.service_type === 'host_metrics') {
        const timestamp = event.timestamp ? new Date(event.timestamp).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19);
        const metricKeys = ['cpu_percent', 'memory_used_bytes', 'disk_used_percent', 'network_rx_bytes', 'cpu', 'memory'];
        
        for (const [key, value] of Object.entries(event)) {
          if (metricKeys.includes(key) && typeof value === 'number') {
            metricRows.push({
              timestamp,
              project_id: event.project_id || 'unknown',
              env: event.env || 'unknown',
              source_node: event.source_node || 'unknown',
              metric_name: key,
              value: value as number,
            });
          }
        }
      } else {
        const { extracted_module, dynamic_labels, level: parsedLevel, timestamp: parsedTimestamp } = pipelineProcessor.process(event);
        const timestamp = parsedTimestamp || (event.timestamp ? new Date(event.timestamp).getTime() : Date.now());
        const level = parsedLevel || event.level || 'INFO';
        
        server.log.info(`[Pipeline] Extracted module: "${extracted_module}" from event. Level: "${level}", Timestamp: "${timestamp}"`);

        logRows.push({
          timestamp: timestamp,
          project_id: event.project_id || 'unknown',
          env: event.env || 'unknown',
          os: event.os || 'unknown',
          source_node: event.source_node || 'unknown',
          service_type: event.service_type || 'unknown',
          level: level,
          extracted_module,
          dynamic_labels,
          message: event.message || JSON.stringify(event),
        });
      }
    }

    if (logRows.length > 0) {
      await clickhouse.insert({
        table: 'loganalyzer.logs_main',
        values: logRows,
        format: 'JSONEachRow',
      });
    }

    if (metricRows.length > 0) {
      await clickhouse.insert({
        table: 'loganalyzer.hardware_metrics',
        values: metricRows,
        format: 'JSONEachRow',
      });
    }

    server.log.info(`Inserted ${logRows.length} logs and ${metricRows.length} metrics into ClickHouse.`);
    return reply.code(202).send({ status: 'accepted', logs: logRows.length, metrics: metricRows.length });
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ status: 'error', message: 'Internal Server Error' });
  }
});

function broadcastAnomaly(extractedModule: string, level: string, issue: string) {
  const anomaly = {
    event: 'anomaly_detected',
    module: extractedModule,
    issue: issue,
    level: level,
    timestamp: new Date().toISOString()
  };
  const payloadStr = JSON.stringify(anomaly);
  server.log.info(`[WS] Broadcasting anomaly: ${payloadStr}`);
  for (const socket of connectedSockets) {
    if (socket.readyState === 1) {
      socket.send(payloadStr);
    }
  }
}

server.post('/api/pipeline/test', async (request, reply) => {
  try {
    const { message = '', service_type = '' } = request.body as any;
    const dummyEvent = { message, service_type };
    const result = pipelineProcessor.process(dummyEvent);
    const resolvedLevel = result.level || 'INFO';
    const timestampStr = result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString();

    if (resolvedLevel === 'ERROR' || resolvedLevel === 'CRITICAL') {
      broadcastAnomaly(
        result.extracted_module || 'unknown',
        resolvedLevel,
        `Live Test Trigger: Detected ${resolvedLevel} log inside test payload`
      );
    }

    return reply.send({
      success: true,
      extracted_module: result.extracted_module,
      dynamic_labels: result.dynamic_labels,
      level: resolvedLevel,
      timestamp: timestampStr
    });
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ success: false, error: 'Failed to test pipeline' });
  }
});

server.post('/api/logs/search', async (request, reply) => {
  try {
    const { query = '', timeRange, limit = 100 } = request.body as any;

    const { whereClause, queryParams } = queryParser.parse(query);
    
    // Add timeRange bounds if provided
    let finalWhere = whereClause;
    if (timeRange?.start) {
      finalWhere += ' AND timestamp >= {start: DateTime64(3, \'UTC\')}';
      queryParams.start = timeRange.start;
    }
    if (timeRange?.end) {
      finalWhere += ' AND timestamp <= {end: DateTime64(3, \'UTC\')}';
      queryParams.end = timeRange.end;
    }

    const clickhouseQuery = `
      SELECT * FROM loganalyzer.logs_main 
      WHERE ${finalWhere} 
      ORDER BY timestamp DESC 
      LIMIT ${Number(limit)}
    `;

    const resultSet = await clickhouse.query({
      query: clickhouseQuery,
      query_params: queryParams,
      format: 'JSONEachRow'
    });

    const dataset = await resultSet.json();
    return reply.send(dataset);
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ status: 'error', message: 'Search failed' });
  }
});

server.post('/api/metrics/correlate', async (request, reply) => {
  try {
    const { timestamp, source_node, env, project_id, windowMinutes = 5 } = request.body as any;

    if (!timestamp) {
      return reply.code(400).send({ error: 'timestamp is required' });
    }

    const centerTime = new Date(timestamp);
    const startTime = new Date(centerTime.getTime() - windowMinutes * 60000);
    const endTime = new Date(centerTime.getTime() + windowMinutes * 60000);

    const clickhouseQuery = `
      SELECT timestamp, metric_name, value 
      FROM loganalyzer.hardware_metrics 
      WHERE timestamp >= {start: DateTime} 
        AND timestamp <= {end: DateTime}
        ${source_node ? 'AND source_node = {node: String}' : ''}
        ${env ? 'AND env = {env: String}' : ''}
        ${project_id ? 'AND project_id = {proj: String}' : ''}
      ORDER BY timestamp ASC
    `;

    const queryParams: any = {
      start: startTime.toISOString().replace('T', ' ').substring(0, 19),
      end: endTime.toISOString().replace('T', ' ').substring(0, 19),
      node: source_node,
      env,
      proj: project_id
    };

    let dataset: any[] = [];
    try {
      const resultSet = await clickhouse.query({
        query: clickhouseQuery,
        query_params: queryParams,
        format: 'JSONEachRow'
      });
      dataset = await resultSet.json() as any[];
    } catch (dbError) {
      server.log.warn('ClickHouse connection failed, returning mock correlation metrics data for UI testing.');
      // Generate mock data for the 10 minute window (1 data point per minute)
      for (let i = -windowMinutes; i <= windowMinutes; i++) {
        const time = new Date(centerTime.getTime() + i * 60000).toISOString().replace('T', ' ').substring(0, 19);
        dataset.push({ timestamp: time, metric_name: 'cpu_percent', value: Math.random() * 40 + 10 });
        dataset.push({ timestamp: time, metric_name: 'memory_used_bytes', value: Math.random() * 2000000000 + 4000000000 });
      }
    }

    return reply.send({
      target_timestamp: centerTime.toISOString().replace('T', ' ').substring(0, 19),
      window: { start: startTime, end: endTime },
      metrics: dataset
    });
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ status: 'error', message: 'Correlation failed' });
  }
});

server.get('/api/agents', async (request, reply) => {
  try {
    const query = `
      SELECT 
        source_node,
        env,
        project_id,
        os,
        max(timestamp) as last_seen
      FROM loganalyzer.logs_main
      WHERE timestamp >= now() - INTERVAL 1 HOUR
      GROUP BY source_node, env, project_id, os
      ORDER BY last_seen DESC
    `;
    
    let dataset: any[] = [];
    try {
      const resultSet = await clickhouse.query({
        query,
        format: 'JSONEachRow'
      });
      dataset = await resultSet.json() as any[];
    } catch (dbError) {
      server.log.warn('ClickHouse connection failed during agents query, returning mock data.');
      const now = new Date();
      dataset = [
        { source_node: 'Q1', env: 'QA', project_id: 'proyecto_x', os: 'linux', last_seen: new Date(now.getTime() - 1000).toISOString().replace('T', ' ').substring(0, 19) },
        { source_node: 'P5', env: 'PROD', project_id: 'proyecto_y', os: 'windows', last_seen: new Date(now.getTime() - 120000).toISOString().replace('T', ' ').substring(0, 19) }
      ];
    }
    
    return reply.send(dataset);
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ error: 'Failed to retrieve active agents' });
  }
});

server.get('/api/analytics/volume', async (request, reply) => {
  try {
    const query = `
      SELECT 
        toStartOfHour(timestamp) as time_bucket,
        level,
        count() as log_count
      FROM loganalyzer.logs_main
      WHERE timestamp >= now() - INTERVAL 24 HOUR
      GROUP BY time_bucket, level
      ORDER BY time_bucket ASC
    `;
    
    let dataset: any[] = [];
    try {
      const resultSet = await clickhouse.query({
        query,
        format: 'JSONEachRow'
      });
      dataset = await resultSet.json() as any[];
    } catch (dbError) {
      server.log.warn('ClickHouse connection failed during volume analytics, returning mock data.');
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const time_bucket = d.toISOString().replace('T', ' ').substring(0, 14) + '00:00';
        dataset.push({ time_bucket, level: 'INFO', log_count: Math.floor(Math.random() * 200) + 100 });
        dataset.push({ time_bucket, level: 'WARNING', log_count: Math.floor(Math.random() * 40) + 5 });
        dataset.push({ time_bucket, level: 'ERROR', log_count: Math.floor(Math.random() * 10) });
        dataset.push({ time_bucket, level: 'CRITICAL', log_count: Math.floor(Math.random() * 2) });
      }
    }
    
    return reply.send(dataset);
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ error: 'Failed to retrieve volume analytics' });
  }
});

server.get('/api/analytics/errors_by_module', async (request, reply) => {
  try {
    const query = `
      SELECT 
        extracted_module,
        count() as error_count
      FROM loganalyzer.logs_main
      WHERE (level = 'ERROR' OR level = 'CRITICAL')
        AND extracted_module != ''
        AND extracted_module != 'unknown'
      GROUP BY extracted_module
      ORDER BY error_count DESC
      LIMIT 10
    `;
    
    let dataset: any[] = [];
    try {
      const resultSet = await clickhouse.query({
        query,
        format: 'JSONEachRow'
      });
      dataset = await resultSet.json() as any[];
    } catch (dbError) {
      server.log.warn('ClickHouse connection failed during errors by module analytics, returning mock data.');
      dataset = [
        { extracted_module: 'generacion_consultas', error_count: 45 },
        { extracted_module: 'citas', error_count: 28 },
        { extracted_module: 'permisos', error_count: 14 },
        { extracted_module: 'citaslite', error_count: 8 },
        { extracted_module: 'nomina', error_count: 3 }
      ];
    }
    
    return reply.send(dataset);
  } catch (err) {
    server.log.error(err);
    return reply.code(500).send({ error: 'Failed to retrieve errors by module' });
  }
});

server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Background worker for Alerts Engine running every 1 minute
setInterval(async () => {
  try {
    server.log.info('[Alerts Engine] Running anomaly detection check on ClickHouse...');
    const query = `
      SELECT extracted_module, count() as err_count
      FROM loganalyzer.logs_main
      WHERE timestamp >= now() - INTERVAL 2 MINUTE
        AND (level = 'ERROR' OR level = 'CRITICAL')
        AND extracted_module != ''
        AND extracted_module != 'unknown'
      GROUP BY extracted_module
      HAVING err_count > 5
    `;
    
    let rows: any[] = [];
    try {
      const resultSet = await clickhouse.query({
        query,
        format: 'JSONEachRow'
      });
      rows = await resultSet.json() as any[];
    } catch (dbErr) {
      server.log.warn('ClickHouse connection failed or not ready during alerts cron. Skipping database check.');
    }

    for (const row of rows) {
      broadcastAnomaly(
        row.extracted_module,
        'CRITICAL',
        `High error rate detected: ${row.err_count} errors in the last 2 minutes`
      );
    }
  } catch (err) {
    server.log.error(err, 'Error in alerts engine cron job');
  }
}, 60000);

const start = async () => {
  try {
    await checkConnection();
    await server.listen({ port: PORT, host: HOST });
    console.log(`[LogAnalyzer Backend] Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
