import { useState } from 'react';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FileResult {
    file_id: number;
    status: 'completed' | 'failed';
    processingTimeMs: number;
    message: string;
}

export function DownloadTester() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FileResult | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const startDownload = async () => {
        setLoading(true);
        setResult(null);
        setElapsed(0);

        const startTime = Date.now();
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/v1/download/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: 70000 })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            clearInterval(timer);
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Download className="w-5 h-5 text-purple-600" />
                Long-Running Download Test
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
                Simulates a download that takes 10-120 seconds. This generates a long span in Jaeger.
            </p>

            <button
                onClick={startDownload}
                disabled={loading}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? `Processing (${elapsed}s)...` : 'Start Download'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded border ${result.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 font-medium mb-1">
                        {result.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={result.status === 'completed' ? 'text-green-800' : 'text-red-800'}>
                            {result.status === 'completed' ? 'Success' : 'Failed'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700">{result.message}</p>
                    <p className="text-xs text-gray-500 mt-2">Time: {(result.processingTimeMs / 1000).toFixed(1)}s</p>
                </div>
            )}
        </div>
    );
}
