import { useEffect } from 'react';
import * as Sentry from "@sentry/react";
import { HealthCheck } from './components/HealthCheck';
import { DownloadTester } from './components/DownloadTester';
import { ErrorLogger } from './components/ErrorLogger';
import { ObservabilityLinks } from './components/ObservabilityLinks';
import { TraceViewer } from './components/TraceViewer';
import { initInstrumentation } from './instrumentation';
import { BarChart3 } from 'lucide-react';

// Initialize Sentry (User must replace DSN in real scenario)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "", // Reads from .env
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
});

// Initialize OpenTelemetry
initInstrumentation();

function App() {
  useEffect(() => {
    // Extra verify hook
    console.log("Dashboard mounted");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Observability Dashboard</h1>
              <p className="text-sm text-gray-500">Delineate Hackathon Challenge 4 - Full Implementation</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">System Healthy</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Status & Tools */}
          <div className="lg:col-span-1 space-y-6">
            <HealthCheck />
            <ObservabilityLinks />
          </div>

          {/* Middle Column - Job Testing */}
          <div className="lg:col-span-1 space-y-6">
            <DownloadTester />
            <ErrorLogger />
          </div>

          {/* Right Column - Tracing */}
          <div className="lg:col-span-1 space-y-6">
            <TraceViewer />

            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
              <h3 className="font-bold mb-2">💡 Observability Features</h3>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong>OpenTelemetry:</strong> Distributed tracing across frontend/backend</li>
                <li><strong>Sentry:</strong> Error tracking with trace correlation</li>
                <li><strong>Prometheus:</strong> Real-time metrics collection</li>
                <li><strong>Grafana:</strong> Metrics visualization dashboards</li>
                <li><strong>Kibana:</strong> Log aggregation and trace viewing</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
