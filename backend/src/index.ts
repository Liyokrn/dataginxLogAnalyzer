import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import { clickhouse, checkConnection } from './db';
import { pipelineProcessor } from './pipeline';

dotenv.config();

const server = Fastify({
  logger: true,
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
        // Simple heuristic for Metric mapping
        const timestamp = event.timestamp ? new Date(event.timestamp).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        // Example: Vector might send 'cpu_percent' as a field
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
        // It's a Log
        const timestamp = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
        const { extracted_module, dynamic_labels } = pipelineProcessor.process(event);
        
        server.log.info(`[Pipeline] Extracted module: "${extracted_module}" from event.`);

        logRows.push({
          timestamp: timestamp, // ClickHouse DateTime64 accepts epoch ms
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

    // Insert Logs
    if (logRows.length > 0) {
      await clickhouse.insert({
        table: 'loganalyzer.logs_main',
        values: logRows,
        format: 'JSONEachRow',
      });
    }

    // Insert Metrics
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
