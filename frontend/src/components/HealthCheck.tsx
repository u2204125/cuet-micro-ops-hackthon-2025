import { useEffect, useState } from 'react';
import { Activity, Server } from 'lucide-react';

interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    checks: {
        storage: 'ok' | 'error';
    };
}

export function HealthCheck() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/health`);
                if (!response.ok) throw new Error('Health check failed');
                const data = await response.json();
                setHealth(data);
                setError(null);

                // Track this API call
                window.dispatchEvent(new CustomEvent('api-call', { detail: { type: 'download' } }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setHealth(null);
            } finally {
                setLoading(false);
            }
        };

        // Check health once on page load
        fetchHealth();
    }, []);

    if (loading && !health) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
            </div>
        );
    }

    const isHealthy = health?.status === 'healthy';
    const storageOk = health?.checks.storage === 'ok';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    System Health
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isHealthy ? 'Healthy' : 'Unhealthy'}
                </span>
            </div>

            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                        Failed to connect to API: {error}
                    </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Storage (S3)</span>
                    </div>
                    <span className={`text-sm ${storageOk ? 'text-green-600' : 'text-red-500'}`}>
                        {storageOk ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>
        </div>
    );
}
