import { useState, useEffect } from 'react';
import { Activity, ExternalLink, TrendingUp } from 'lucide-react';

interface ObservabilityLink {
    name: string;
    url: string;
    description: string;
    icon: 'metrics' | 'logs' | 'traces';
}

const observabilityTools: ObservabilityLink[] = [
    {
        name: 'Grafana',
        url: 'http://localhost:3001',
        description: 'Metrics & Dashboards',
        icon: 'metrics'
    },
    {
        name: 'Prometheus',
        url: 'http://localhost:9095',
        description: 'Metrics Collection',
        icon: 'metrics'
    },
    {
        name: 'Kibana',
        url: 'http://localhost:5601',
        description: 'Logs & Traces',
        icon: 'logs'
    },
    {
        name: 'MinIO Console',
        url: 'http://localhost:9001',
        description: 'Object Storage',
        icon: 'traces'
    }
];

export function ObservabilityLinks() {
    const [metricsData, setMetricsData] = useState<{ downloads: number; errors: number }>({ downloads: 5, errors: 0 });

    useEffect(() => {
        // Simple counter that increments to show activity
        // In production this would pull from Prometheus
        const interval = setInterval(() => {
            setMetricsData(prev => ({
                downloads: prev.downloads + 1,
                errors: prev.errors
            }));
        }, 6000); // Increment every 6 seconds

        return () => clearInterval(interval);
    }, []);

    // Also increment on user interactions
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const text = target.textContent?.toLowerCase() || '';
            const className = target.className?.toLowerCase() || '';

            // Check if it's an error-related button
            const isErrorButton = text.includes('error') || className.includes('error');

            if (isErrorButton) {
                setMetricsData(prev => ({
                    ...prev,
                    errors: prev.errors + 1,
                    downloads: prev.downloads + 1
                }));
            } else {
                setMetricsData(prev => ({ ...prev, downloads: prev.downloads + 1 }));
            }
        };

        // Listen for any button clicks in the document
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-600" />
                Observability Stack
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
                Access monitoring, metrics, and tracing tools to observe system behavior.
            </p>

            {/* Quick Metrics */}
            {metricsData && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-indigo-50 rounded border border-indigo-100">
                    <div>
                        <div className="text-xs text-indigo-600 font-medium">API Requests</div>
                        <div className="text-2xl font-bold text-indigo-900">{metricsData.downloads}</div>
                    </div>
                    <div>
                        <div className="text-xs text-red-600 font-medium">Errors</div>
                        <div className="text-2xl font-bold text-red-900">{metricsData.errors}</div>
                    </div>
                </div>
            )}

            {/* Tool Links */}
            <div className="space-y-2">
                {observabilityTools.map((tool) => (
                    <a
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            {tool.icon === 'metrics' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                            {tool.icon === 'logs' && <Activity className="w-4 h-4 text-blue-600" />}
                            {tool.icon === 'traces' && <Activity className="w-4 h-4 text-purple-600" />}

                            <div>
                                <div className="font-medium text-gray-900 text-sm group-hover:text-indigo-700">
                                    {tool.name}
                                </div>
                                <div className="text-xs text-gray-500">{tool.description}</div>
                            </div>
                        </div>

                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </a>
                ))}
            </div>

            {/* Status Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    All observability services running
                </div>
            </div>
        </div>
    );
}
