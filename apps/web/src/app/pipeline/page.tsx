"use client"

import * as React from "react"
import { Plus, GripVertical, Settings2, Trash2, ArrowRight, CheckCircle2, Play } from "lucide-react"

export default function PipelineEditorPage() {
  const [testLog, setTestLog] = React.useState('192.168.1.10 - - [19/Jun/2026:15:46:06 +0000] "GET /var/www/auth-service/api/v1/login HTTP/1.1" 200')
  const [pattern, setPattern] = React.useState('/var/www/(?<modulo>[a-zA-Z0-9-]+)')
  
  // Mock live extraction logic
  const match = testLog.match(new RegExp(pattern))
  const extracted = match?.groups ? Object.entries(match.groups) : []

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline Editor</h1>
        <p className="text-sm text-gray-500">
          Visually configure log ingestion parsing, enrichment, and routing rules.
        </p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Col: Pipeline Flow */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span>Execution Flow</span>
            <button className="flex items-center gap-1 text-blue-500 hover:text-blue-400">
              <Plus className="h-4 w-4" /> Add Step
            </button>
          </div>

          {[
            { title: "Ingestion", desc: "Nginx Access Logs", icon: ArrowRight, color: "text-blue-400" },
            { title: "Parse", desc: "Regex Matcher", icon: Settings2, color: "text-(--status-warn)", active: true },
            { title: "Enrichment", desc: "GeoIP Lookup", icon: Settings2, color: "text-gray-400" },
            { title: "Indexing", desc: "Elasticsearch", icon: CheckCircle2, color: "text-(--status-ok)" },
          ].map((step, idx) => (
            <div 
              key={idx}
              className={`rounded-xl border p-4 transition-colors cursor-pointer flex items-center gap-3 ${
                step.active 
                  ? "border-blue-500 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "border-(--border) bg-(--card) hover:border-gray-600"
              }`}
            >
              <GripVertical className="h-5 w-5 text-gray-600 cursor-grab" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{step.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
              </div>
              <step.icon className={`h-5 w-5 ${step.color}`} />
            </div>
          ))}
        </div>

        {/* Right Col: Editor & Preview */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden border border-(--border) rounded-xl bg-(--card)">
          <div className="border-b border-(--border) p-4 bg-[#0A0E17]">
            <h2 className="font-semibold">Parse Configuration: Regex Matcher</h2>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Dynamic Extraction Rule (Regex)</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full rounded-md border border-(--border) bg-[#05080F] p-3 text-sm font-mono focus:border-blue-500 focus:outline-none"
                placeholder="e.g., /var/www/(?<modulo>[a-zA-Z0-9-]+)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use named capture groups like <code>(?&lt;name&gt;pattern)</code> to map values to fields.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-400">Live Test Payload</label>
                <button className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-800 hover:bg-blue-900/50">
                  <Play className="h-3 w-3" /> Test
                </button>
              </div>
              <textarea
                value={testLog}
                onChange={(e) => setTestLog(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-(--border) bg-[#05080F] p-3 text-sm font-mono focus:border-blue-500 focus:outline-none resize-none text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Extraction Results</label>
              <div className="rounded-md border border-(--border) bg-[#05080F] p-4 font-mono text-sm min-h-[120px]">
                {extracted.length > 0 ? (
                  <div className="space-y-2">
                    {extracted.map(([key, val]) => (
                      <div key={key} className="flex gap-4 border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-blue-400 w-24">"{key}":</span>
                        <span className="text-green-400">"{val}"</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600">No match found.</span>
                )}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-(--border)">
              <button className="px-4 py-2 text-sm text-gray-400 hover:text-(--foreground)">Cancel</button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md font-medium hover:bg-blue-500">Save Rule</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
