import { createClient } from '@clickhouse/client';
import * as dotenv from 'dotenv';

dotenv.config();

export const clickhouse = createClient({
  url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || 'default',
  database: process.env.CLICKHOUSE_DB || 'loganalyzer',
});

// Helper to check connection on startup
export async function checkConnection() {
  try {
    const response = await clickhouse.query({
      query: 'SELECT 1',
      format: 'JSONEachRow',
    });
    const result = await response.json();
    console.log('[ClickHouse] Connected successfully:', result);
    return true;
  } catch (error) {
    console.error('[ClickHouse] Connection failed:', error);
    return false;
  }
}
