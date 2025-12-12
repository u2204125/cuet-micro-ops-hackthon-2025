import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function ErrorTrigger() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const triggerError = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/v1/download/check?sentry_test=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: 12345 })
            });
            // Calling this endpoint with sentry_test=true returns 500 error
            if (!response.ok) {
                const data = await response.json();
                setErrorMsg(`Server Error: ${data.message || response.statusText}`);
            }
        } catch (error) {
            setErrorMsg('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Error Tracking
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
                Triggers an intentional 500 error on the backend to verify Sentry capture.
            </p>

            <button
                onClick={triggerError}
                disabled={loading}
                className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Trigger Backend Error
            </button>

            {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                    <strong>Captured:</strong> {errorMsg}
                </div>
            )}
        </div>
    );
}
