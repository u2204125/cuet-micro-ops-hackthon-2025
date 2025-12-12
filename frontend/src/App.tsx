import { useEffect } from 'react';
import * as Sentry from "@sentry/react";
import { HealthCheck } from './components/HealthCheck';
import { DownloadTester } from './components/DownloadTester';
import { ErrorTrigger } from './components/ErrorTrigger';
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Observability Dashboard</h1>
              <p className="text-sm text-gray-500">Delineate Hackathon Challenge 4</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <a href="http://localhost:3001" target="_blank" className="hover:text-blue-600 underline">View System Metrics (Grafana)</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Health Status Column */}
          <div className="col-span-1">
            <HealthCheck />
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
              <h3 className="font-bold mb-2">How to use this dashboard</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>Start a long download to see traces in Jaeger.</li>
                <li>Trigger an error to see it in Sentry.</li>
                <li>Sentry DSN needs to be configured in .env for error reporting to work effectively.</li>
              </ul>
            </div>
          </div>

          {/* Actions Column */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <DownloadTester />
            <ErrorTrigger />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
