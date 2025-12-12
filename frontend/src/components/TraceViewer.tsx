import { useState, useEffect } from "react";
import { Code, Copy, CheckCircle2 } from "lucide-react";
import { trace } from "@opentelemetry/api";

interface TraceInfo {
  traceId: string;
  spanId: string;
  timestamp: string;
}

export function TraceViewer() {
  const [traceInfo, setTraceInfo] = useState<TraceInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get current trace context
    const updateTraceInfo = () => {
      try {
        const span = trace.getActiveSpan();
        if (span) {
          const spanContext = span.spanContext();
          setTraceInfo({
            traceId: spanContext.traceId,
            spanId: spanContext.spanId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Failed to get trace info:", error);
      }
    };

    updateTraceInfo();
    const interval = setInterval(updateTraceInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyTraceId = async () => {
    if (traceInfo) {
      await navigator.clipboard.writeText(traceInfo.traceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-purple-600" />
        Distributed Tracing
      </h2>

      <p className="text-gray-600 mb-4 text-sm">
        End-to-end trace correlation between frontend and backend requests.
      </p>

      {traceInfo ? (
        <div className="space-y-3">
          {/* Trace ID */}
          <div className="bg-purple-50 p-3 rounded border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-purple-700">
                Active Trace ID
              </span>
              <button
                onClick={copyTraceId}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Copy trace ID"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-purple-900 break-all">
              {traceInfo.traceId}
            </code>
          </div>

          {/* Span ID */}
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <div className="text-xs font-medium text-blue-700 mb-1">
              Current Span ID
            </div>
            <code className="text-xs font-mono text-blue-900 break-all">
              {traceInfo.spanId}
            </code>
          </div>

          {/* Correlation Flow */}
          <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-2">
            <div className="font-medium text-gray-700">
              Trace Propagation Flow:
            </div>
            <div className="space-y-1 text-gray-600 pl-3">
              <div>✓ Frontend span created</div>
              <div>✓ traceparent header attached</div>
              <div>✓ Backend receives context</div>
              <div>✓ Logs tagged with trace ID</div>
              <div>✓ Sentry errors correlated</div>
            </div>
          </div>

          {/* Kibana Link */}
          <a
            href={`http://localhost:5601/app/apm/traces?kuery=trace.id:"${traceInfo.traceId}"`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm text-center transition-colors"
          >
            View Trace in Kibana →
          </a>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center text-sm text-gray-600">
          No active trace. Interact with the dashboard to generate traces.
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-xs border border-blue-100">
        <strong>Correlation Demo:</strong> All API requests include trace IDs.
        Check backend logs, Kibana, or Sentry to see the same trace ID across
        services.
      </div>
    </div>
  );
}
