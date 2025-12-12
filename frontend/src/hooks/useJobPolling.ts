import { useState, useEffect, useRef } from 'react';

export interface JobStatus {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalFiles: number;
    result: {
        successCount: number;
        failedCount: number;
        downloadUrls?: string[];
        message: string;
    } | null;
}

interface UseJobPollingOptions {
    pollInterval?: number; // milliseconds
    enabled?: boolean;
}

export function useJobPolling(
    jobId: string | null,
    options: UseJobPollingOptions = {},
) {
    const { pollInterval = 2000, enabled = true } = options;

    const [data, setData] = useState<JobStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!jobId || !enabled) {
            return;
        }

        const fetchJobStatus = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/v1/download/jobs/${jobId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Job not found');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const jobStatus: JobStatus = await response.json();
                setData(jobStatus);
                setError(null);

                // Stop polling if job is complete or failed
                if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch job status');
                setIsLoading(false);
            }
        };

        // Start polling
        setIsLoading(true);
        fetchJobStatus(); // Fetch immediately

        intervalRef.current = window.setInterval(fetchJobStatus, pollInterval);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [jobId, pollInterval, enabled]);

    return {
        data,
        isLoading,
        error,
        isPolling: intervalRef.current !== null,
    };
}
