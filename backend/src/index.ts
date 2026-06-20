import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import { clickhouse, checkConnection } from './db';

dotenv.config();

const server = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

server.post('/api/ingest', async (request, reply) => {
  try {
    const data: any = request.body;
    // Vector can send single objects or arrays of events
    const events = Array.isArray(data) ? data : [data];

    if (events.length === 0) {
      return reply.code(200).send({ status: 'ignored', reason: 'empty payload' });
    }

    // In a real scenario, here we do Batch Insert into ClickHouse.
    // We simulate it here by logging the count.
    server.log.info(`Received ${events.length} log events from Vector.`);

    return reply.code(202).send({ status: 'accepted', count: events.length });
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
    // Check DB Connection before starting
    await checkConnection();

    await server.listen({ port: PORT, host: HOST });
    console.log(`[LogAnalyzer Backend] Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
