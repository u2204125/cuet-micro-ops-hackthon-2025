import { useState } from "react";
import {
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useJobPolling } from "../hooks/useJobPolling";

export function DownloadTester() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [initiating, setInitiating] = useState(false);

  const { data: jobStatus, isPolling, error } = useJobPolling(jobId);

  const startDownload = async () => {
    setInitiating(true);
    setJobId(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/v1/download/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: [70000, 70007, 70014, 70021] }),
      });
      const data = await response.json();
      setJobId(data.jobId);

      // Track this API call
      window.dispatchEvent(
        new CustomEvent("api-call", { detail: { type: "download" } }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setInitiating(false);
    }
  };

  const reset = () => {
    setJobId(null);
  };

  const isActive = initiating || isPolling;
  const showProgress =
    jobStatus &&
    (jobStatus.status === "processing" || jobStatus.status === "queued");
  const isComplete = jobStatus?.status === "completed";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-purple-600" />
        Async Job Polling System
      </h2>

      <p className="text-gray-600 mb-4 text-sm">
        Initiates a download job and polls for status. Watch progress in
        real-time as the queue processes files!
      </p>

      <button
        onClick={startDownload}
        disabled={isActive}
        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {isActive ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isActive ? "Processing..." : "Start Async Download Job"}
      </button>

      {/* Job Status Display */}
      {jobStatus && (
        <div className="mt-4 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {jobStatus.status === "queued" && (
                <>
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Queued
                  </span>
                </>
              )}
              {jobStatus.status === "processing" && (
                <>
                  <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-blue-800">
                    Processing
                  </span>
                </>
              )}
              {jobStatus.status === "completed" && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Completed
                  </span>
                </>
              )}
              {jobStatus.status === "failed" && (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Failed
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Job ID: {jobId?.slice(0, 8)}...
            </span>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{jobStatus.progress}% complete</span>
                <span>{jobStatus.totalFiles} files</span>
              </div>
            </div>
          )}

          {/* Results */}
          {jobStatus.result && (
            <div
              className={`p-4 rounded border ${isComplete ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <p className="text-sm font-medium mb-2">
                {jobStatus.result.message}
              </p>
              <div className="text-xs text-gray-700 space-y-1">
                <div>
                  ✓ Success: {jobStatus.result.successCount}/
                  {jobStatus.totalFiles}
                </div>
                <div>
                  ✗ Failed: {jobStatus.result.failedCount}/
                  {jobStatus.totalFiles}
                </div>
                {jobStatus.result.downloadUrls &&
                  jobStatus.result.downloadUrls.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Download URLs ready!</span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              Error: {error}
            </div>
          )}

          {/* Reset Button */}
          {!isActive && (
            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
            >
              Start New Job
            </button>
          )}
        </div>
      )}
    </div>
  );
}
