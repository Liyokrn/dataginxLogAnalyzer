export interface PipelineRule {
  id: string;
  name: string;
  pattern: RegExp;
  service_type_filter?: string;
}

export interface ProcessResult {
  extracted_module: string;
  dynamic_labels: Record<string, string>;
  level?: string;
  timestamp?: number;
}

export function parseCustomTimestamp(tsStr: string): number | null {
  if (!tsStr) return null;
  
  // Format: 20-Jun-2026 20:42:02
  const fpmMatch = tsStr.match(/^(\d{2})-([a-zA-Z]{3})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (fpmMatch) {
    const [, day, monthStr, year, hour, minute, second] = fpmMatch;
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = months[monthStr.toLowerCase()];
    if (month) {
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).getTime();
    }
  }
  
  // Format: 2026/06/20 00:00:37
  const nginxMatch = tsStr.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (nginxMatch) {
    const [, year, month, day, hour, minute, second] = nginxMatch;
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).getTime();
  }

  const parsed = new Date(tsStr).getTime();
  return isNaN(parsed) ? null : parsed;
}

export class PipelineProcessor {
  private activeRules: PipelineRule[] = [
    {
      id: 'rule_1',
      name: 'Nginx Module Extractor',
      pattern: /\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/,
      service_type_filter: 'nginx'
    }
  ];

  public process(logEvent: any): ProcessResult {
    let extracted_module = '';
    const dynamic_labels: Record<string, string> = {};
    let level: string | undefined;
    let timestamp: number | undefined;

    const message = logEvent.message || '';
    const service_type = logEvent.service_type || '';

    // Strategy 1: Nginx Error Log
    if (service_type === 'nginx') {
      const errMatch = message.match(/^(?<timestamp>\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(?<level>[a-zA-Z_-]+)\]/);
      if (errMatch && errMatch.groups) {
        level = errMatch.groups.level.toUpperCase();
        const tsParsed = parseCustomTimestamp(errMatch.groups.timestamp);
        if (tsParsed) timestamp = tsParsed;

        // Extract upstream socket if exists
        const upstreamMatch = message.match(/upstream: "([^"]+)"/);
        if (upstreamMatch) {
          dynamic_labels['upstream'] = upstreamMatch[1];
        }

        // Extract module from request path: e.g. request: "POST /generacion_consultas/ws/ws_puertoem.php HTTP/1.0"
        const requestMatch = message.match(/request:\s*"[A-Z]+\s+\/([a-zA-Z0-9_-]+)/);
        if (requestMatch) {
          extracted_module = requestMatch[1];
        } else {
          // Fallback module matching from path in the error message
          const pathMatch = message.match(/\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/);
          if (pathMatch && pathMatch.groups) {
            extracted_module = pathMatch.groups.modulo;
          }
        }
      } else {
        // Fallback or Access Log: match /var/www/({modulo})/
        const pathMatch = message.match(/\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/);
        if (pathMatch && pathMatch.groups) {
          extracted_module = pathMatch.groups.modulo;
        }
      }
    }
    // Strategy 2: PHP-FPM Log
    else if (service_type === 'php-fpm') {
      const fpmMatch = message.match(/^\[(?<timestamp>\d{2}-[a-zA-Z]{3}-\d{4} \d{2}:\d{2}:\d{2})\] (?<level>[A-Z]+):/);
      if (fpmMatch && fpmMatch.groups) {
        level = fpmMatch.groups.level.toUpperCase();
        const tsParsed = parseCustomTimestamp(fpmMatch.groups.timestamp);
        if (tsParsed) timestamp = tsParsed;
      }
      
      const scriptMatch = message.match(/script\s+'\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/);
      if (scriptMatch && scriptMatch.groups) {
        extracted_module = scriptMatch.groups.modulo;
      }
    }
    // Strategy 3: PHP Slow Log Multiline
    else if (service_type === 'php-slow') {
      const slowMatch = message.match(/^\[(?<timestamp>\d{2}-[a-zA-Z]{3}-\d{4} \d{2}:\d{2}:\d{2})\]/);
      if (slowMatch && slowMatch.groups) {
        level = 'WARNING';
        const tsParsed = parseCustomTimestamp(slowMatch.groups.timestamp);
        if (tsParsed) timestamp = tsParsed;
      }

      const scriptMatch = message.match(/script_filename\s*=\s*\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/);
      if (scriptMatch && scriptMatch.groups) {
        extracted_module = scriptMatch.groups.modulo;
      } else {
        const pathMatch = message.match(/\/var\/www\/(?<modulo>[a-zA-Z0-9_-]+)/);
        if (pathMatch && pathMatch.groups) {
          extracted_module = pathMatch.groups.modulo;
        }
      }
    }
    // Fallback: Run standard activeRules (for other service types or general match)
    else {
      for (const rule of this.activeRules) {
        if (rule.service_type_filter && rule.service_type_filter !== service_type) {
          continue;
        }

        const match = message.match(rule.pattern);
        if (match && match.groups) {
          for (const [key, value] of Object.entries(match.groups)) {
            if (key === 'modulo') {
              extracted_module = value as string;
            } else {
              dynamic_labels[key] = value as string;
            }
          }
        }
      }
    }

    return { extracted_module, dynamic_labels, level, timestamp };
  }
}

export const pipelineProcessor = new PipelineProcessor();
