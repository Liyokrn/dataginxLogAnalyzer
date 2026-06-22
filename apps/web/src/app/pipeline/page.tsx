"use client"

import * as React from "react"
import { Plus, GripVertical, Settings2, Trash2, ArrowRight, CheckCircle2, Play, RefreshCw, AlertCircle } from "lucide-react"

export default function PipelineEditorPage() {
  const presets = [
    {
      name: "Nginx Error Log",
      message: `2026/06/20 00:00:37 [error] 1303#1303: *7660964 FastCGI sent in stderr: "PHP message: PHP Notice: Undefined index..." while reading response header from upstream, client: 10.10.27.254, server: pis-qa.semar.gob.mx, request: "POST /generacion_consultas/ws/ws_puertoem.php HTTP/1.0"`,
      service_type: "nginx",
      pattern: `request:\\s*"[A-Z]+\\s+\\/([a-zA-Z0-9_-]+)`
    },
    {
      name: "PHP-FPM Log",
      message: `[20-Jun-2026 20:42:02] WARNING: [pool www] child 2046580, script '/var/www/citas/versolpendientetrans.php' (request: "GET /citas/versolpendientetrans.php?idtrpt=4689052") executing too slow (2.346203 sec)`,
      service_type: "php-fpm",
      pattern: `script\\s+'\\/var\\/www\\/(?<modulo>[a-zA-Z0-9_-]+)`
    },
    {
      name: "PHP Slow Log (Multiline)",
      message: `[20-Jun-2026 20:35:12]  [pool www] pid 2047417\nscript_filename = /var/www/citas/versolpendientetrans.php\n[0x0000766588c160e0] sqlsrv_fetch_array() /var/www/citas`,
      service_type: "php-slow",
      pattern: `script_filename\\s*=\\s*\\/var\\/www\\/(?<modulo>[a-zA-Z0-9_-]+)`
    }
  ]

  const [testLog, setTestLog] = React.useState(presets[0].message)
  const [pattern, setPattern] = React.useState(presets[0].pattern)
  const [serviceType, setServiceType] = React.useState(presets[0].service_type)
  const [extractedResult, setExtractedResult] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Local client-side fallback/live regex match as user types
  let localExtracted: [string, string][] = []
  try {
    const match = testLog.match(new RegExp(pattern))
    if (match?.groups) {
      localExtracted = Object.entries(match.groups)
    }
  } catch (e) {}

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/api/pipeline/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testLog, service_type: serviceType })
      })
      if (!res.ok) throw new Error('Backend test execution failed')
      const data = await res.json()
      if (data.success) {
        setExtractedResult(data)
      } else {
        throw new Error(data.error || 'Unknown parsing error')
      }
    } catch (err: any) {
      setError(err.message || 'Error executing test')
    } finally {
      setLoading(false)
    }
  };

  const loadPreset = (preset: typeof presets[0]) => {
    setTestLog(preset.message)
    setPattern(preset.pattern)
    setServiceType(preset.service_type)
    setExtractedResult(null)
    setError(null)
  }

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
            { title: "Ingestion", desc: "Nginx / PHP Sources", icon: ArrowRight, color: "text-blue-400" },
            { title: "Parse", desc: "Regex strategies", icon: Settings2, color: "text-(--status-warn)", active: true },
            { title: "Enrichment", desc: "GeoIP Lookup", icon: Settings2, color: "text-gray-400" },
            { title: "Indexing", desc: "ClickHouse Ingestion", icon: CheckCircle2, color: "text-(--status-ok)" },
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
          <div className="border-b border-(--border) p-4 bg-[#0A0E17] flex justify-between items-center">
            <h2 className="font-semibold">Parse Configuration: Regex Matcher</h2>
            
            {/* Presets Quick Load */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-2 font-medium">Load Preset:</span>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    serviceType === preset.service_type
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-[#0A0E17] border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Service Type (Vector Stream)</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-md border border-(--border) bg-[#05080F] p-3 text-sm focus:border-blue-500 focus:outline-none text-gray-300"
                >
                  <option value="nginx">nginx (Nginx Access / Error)</option>
                  <option value="php-fpm">php-fpm (PHP-FPM Log)</option>
                  <option value="php-slow">php-slow (PHP Slow Log Multiline)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Dynamic Extraction Rule (Regex)</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full rounded-md border border-(--border) bg-[#05080F] p-3 text-sm font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., /var/www/(?<modulo>[a-zA-Z0-9-]+)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-400">Live Test Payload</label>
                <button 
                  onClick={handleTest}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-opacity"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Test Backend Parser
                </button>
              </div>
              <textarea
                value={testLog}
                onChange={(e) => setTestLog(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-(--border) bg-[#05080F] p-3 text-sm font-mono focus:border-blue-500 focus:outline-none resize-none text-gray-300"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-900/10 border border-red-800 p-4 flex gap-2 items-center text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Local Regex Match */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Local Regex Preview Match</label>
                <div className="rounded-md border border-(--border) bg-[#05080F] p-4 font-mono text-sm min-h-[140px] flex flex-col justify-start">
                  {localExtracted.length > 0 ? (
                    <div className="space-y-2">
                      {localExtracted.map(([key, val]) => (
                        <div key={key} className="flex gap-4 border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                          <span className="text-blue-400 w-24 flex-shrink-0">"{key}":</span>
                          <span className="text-green-400">"{val}"</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">No local match found. Modify pattern or payload to test live.</span>
                  )}
                </div>
              </div>

              {/* Backend Parser Execution Output */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Backend Live Parser Output</label>
                <div className="rounded-md border border-blue-900/50 bg-[#060B14] p-4 font-mono text-sm min-h-[140px]">
                  {extractedResult ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-4 border-b border-gray-800 pb-1.5">
                        <span className="text-blue-400 w-32 flex-shrink-0">extracted_module:</span>
                        <span className="text-green-400 font-bold">"{extractedResult.extracted_module || "(null)"}"</span>
                      </div>
                      <div className="flex gap-4 border-b border-gray-800 pb-1.5">
                        <span className="text-blue-400 w-32 flex-shrink-0">level:</span>
                        <span className={`font-semibold ${
                          extractedResult.level === 'ERROR' ? 'text-red-400' :
                          extractedResult.level === 'WARNING' ? 'text-yellow-400' : 'text-green-400'
                        }`}>"{extractedResult.level}"</span>
                      </div>
                      <div className="flex gap-4 border-b border-gray-800 pb-1.5">
                        <span className="text-blue-400 w-32 flex-shrink-0">timestamp (ISO):</span>
                        <span className="text-purple-400">"{extractedResult.timestamp}"</span>
                      </div>
                      {Object.keys(extractedResult.dynamic_labels).length > 0 && (
                        <div className="pt-1">
                          <div className="text-gray-500 mb-1">dynamic_labels:</div>
                          {Object.entries(extractedResult.dynamic_labels).map(([key, val]: any) => (
                            <div key={key} className="flex gap-4 pl-2">
                              <span className="text-blue-300 w-28 flex-shrink-0">"{key}":</span>
                              <span className="text-green-300">"{val}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">Click "Test Backend Parser" to run log through the Pipeline Processor.</span>
                  )}
                </div>
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

