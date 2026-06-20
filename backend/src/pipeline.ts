export interface PipelineRule {
  id: string;
  name: string;
  pattern: RegExp;
  service_type_filter?: string;
}

// In a real system, these rules would be fetched dynamically from the DB or Cache.
// For now, we simulate active pipelines.
export const activeRules: PipelineRule[] = [
  {
    id: 'rule_1',
    name: 'Nginx Module Extractor',
    pattern: /\/var\/www\/(?<modulo>[a-zA-Z0-9-]+)/,
    service_type_filter: 'nginx'
  }
];

export function runPipelineExtractions(logEvent: any) {
  let extracted_module = '';
  const dynamic_labels: Record<string, string> = {};

  const message = logEvent.message || '';
  const service_type = logEvent.service_type || '';

  for (const rule of activeRules) {
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

  return { extracted_module, dynamic_labels };
}
