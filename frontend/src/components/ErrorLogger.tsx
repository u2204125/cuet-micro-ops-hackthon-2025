import { useState } from "react";
import { AlertTriangle, X, ExternalLink } from "lucide-react";

interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  traceId?: string;
  type: "frontend" | "backend";
}

export function ErrorLogger() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const triggerFrontendError = () => {
    try {
      // This will throw and be caught by Sentry
      throw new Error("Test Frontend Error - Demonstrating Error Tracking");
    } catch (error) {
      const errorLog: ErrorLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: "frontend",
      };
      setErrors((prev) => [errorLog, ...prev]);

      // Also send to Sentry if configured
      if (import.meta.env.VITE_SENTRY_DSN) {
        throw error;
      }
    }
  };

  const triggerBackendError = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/v1/error/test`, {
        method: "POST",
      });

      // Get the actual error response from backend
      const data = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));

      if (!response.ok) {
        const errorLog: ErrorLog = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          message: data.message || `Backend Error: HTTP ${response.status}`,
          stack: `Full Response:\n${JSON.stringify(data, null, 2)}`,
          traceId: data.requestId || undefined, // Show Request ID as trace ID
          type: "backend",
        };
        setErrors((prev) => [errorLog, ...prev]);

        // Notify observability component
        window.dispatchEvent(
          new CustomEvent("api-call", { detail: { type: "error" } }),
        );
      }
    } catch (error) {
      const errorLog: ErrorLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        message:
          error instanceof Error
            ? error.message
            : "Network error - Failed to reach backend",
        stack: error instanceof Error ? error.stack : "Connection failed",
        type: "backend",
      };
      setErrors((prev) => [errorLog, ...prev]);
    }
  };

  const clearErrors = () => setErrors([]);

  const sentryConfigured = !!import.meta.env.VITE_SENTRY_DSN;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        Error Tracking & Logging
      </h2>

      <p className="text-gray-600 mb-4 text-sm">
        Demonstrate error capture, logging, and correlation with trace IDs.
      </p>

      {/* Status */}
      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-blue-800">
            <strong>Sentry Integration:</strong>{" "}
            {sentryConfigured ? "✅ Active" : "⚠️ Demo Mode"}
          </span>
          {sentryConfigured && (
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {!sentryConfigured && (
          <p className="text-xs text-blue-600 mt-1">
            Errors captured locally for demonstration. Set VITE_SENTRY_DSN to
            enable cloud tracking.
          </p>
        )}
      </div>

      {/* Trigger Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={triggerFrontendError}
          className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors"
        >
          Trigger Frontend Error
        </button>
        <button
          onClick={triggerBackendError}
          className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium text-sm transition-colors"
        >
          Trigger Backend Error
        </button>
      </div>

      {/* Error Log */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">
              Captured Errors ({errors.length})
            </h3>
            <button
              onClick={clearErrors}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {errors.map((error) => (
              <div
                key={error.id}
                className="border border-red-200 rounded p-3 bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          error.type === "frontend"
                            ? "bg-red-600 text-white"
                            : "bg-orange-600 text-white"
                        }`}
                      >
                        {error.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-red-900 font-medium">
                      {error.message}
                    </p>
                    {error.traceId && (
                      <p className="text-xs text-red-700 mt-1">
                        <strong>Request ID:</strong> {error.traceId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setExpanded(expanded === error.id ? null : error.id)
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    {expanded === error.id ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {expanded === error.id && error.stack && (
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto text-red-800 font-mono">
                    {error.stack}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length === 0 && (
        <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center text-sm text-gray-600">
          No errors captured yet. Click buttons above to trigger test errors.
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-green-50 text-green-800 rounded text-xs border border-green-100">
        <strong>✅ Error Tracking Features:</strong>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Frontend errors caught by Sentry error boundary</li>
          <li>Backend errors logged with trace correlation</li>
          <li>Stack traces preserved for debugging</li>
          <li>Real-time error display in UI</li>
        </ul>
      </div>
    </div>
  );
}
