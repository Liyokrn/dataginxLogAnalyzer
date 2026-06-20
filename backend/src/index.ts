import Fastify from 'fastify';
import cors from '@fastify/cors';
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
        const timestamp = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
        const { extracted_module, dynamic_labels } = pipelineProcessor.process(event);
        
        server.log.info(`[Pipeline] Extracted module: "${extracted_module}" from event.`);

        logRows.push({
          timestamp: timestamp,
          project_id: event.project_id || 'unknown',
          env: event.env || 'unknown',
          os: event.os || 'unknown',
          source_node: event.source_node || 'unknown',
          service_type: event.service_type || 'unknown',
          level: event.level || 'INFO',
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

server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

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
