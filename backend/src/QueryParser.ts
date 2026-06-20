export class QueryParser {
  public parse(queryString: string) {
    if (!queryString || queryString.trim() === '') {
      return { whereClause: '1 = 1', queryParams: {} };
    }

    // A very basic KQL-like parser separating by spaces or "AND"
    // e.g. "modulo:nomina AND level:INFO" or "modulo:nomina level:INFO"
    const parts = queryString.split(/(?:\s+AND\s+|\s+)/i);
    const whereClauses: string[] = [];
    const queryParams: Record<string, string> = {};

    parts.forEach((part, index) => {
      const splitIndex = part.indexOf(':');
      if (splitIndex > -1) {
        let field = part.substring(0, splitIndex).trim();
        const value = part.substring(splitIndex + 1).trim();

        // Map "modulo" to the schema's "extracted_module"
        if (field === 'modulo') {
          field = 'extracted_module';
        }

        // Add to query params to prevent SQL Injection
        const paramKey = `param_${index}`;
        
        // Handling dynamic labels (if field is not a known top-level column)
        const knownColumns = ['project_id', 'env', 'os', 'source_node', 'service_type', 'level', 'extracted_module', 'message'];
        
        if (knownColumns.includes(field)) {
          whereClauses.push(`${field} = {${paramKey}: String}`);
        } else {
          // If it's a dynamic label
          whereClauses.push(`dynamic_labels['${field}'] = {${paramKey}: String}`);
        }
        
        queryParams[paramKey] = value;
      }
    });

    if (whereClauses.length === 0) {
      return { whereClause: '1 = 1', queryParams: {} };
    }

    return {
      whereClause: whereClauses.join(' AND '),
      queryParams
    };
  }
}

export const queryParser = new QueryParser();
