import type { Job } from "bullmq";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { z } from "zod";

// Job data schema
export const DownloadJobDataSchema = z.object({
    file_ids: z.array(z.number().int().min(10000).max(100000000)),
    jobId: z.string(),
});

export type DownloadJobData = z.infer<typeof DownloadJobDataSchema>;

// Job result schema
export const DownloadJobResultSchema = z.object({
    status: z.enum(["completed", "failed"]),
    totalFiles: z.number().int(),
    successCount: z.number().int(),
    failedCount: z.number().int(),
    downloadUrls: z.array(z.string()).optional(),
    message: z.string(),
});

export type DownloadJobResult = z.infer<typeof DownloadJobResultSchema>;

// Redis connection configuration
const getRedisConnection = () => {
    const host = process.env.REDIS_HOST ?? "localhost";
    const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);
    const password = process.env.REDIS_PASSWORD ?? undefined;

    return new Redis({
        host,
        port,
        password,
        maxRetriesPerRequest: null, // Required for BullMQ
    });
};

// Create shared Redis connection for queue and worker
const connection = getRedisConnection();

// Queue name
export const QUEUE_NAME = "downloads";

// Create the queue
export const downloadQueue = new Queue<DownloadJobData, DownloadJobResult>(
    QUEUE_NAME,
    {
        connection,
        defaultJobOptions: {
            attempts: 3, // Retry up to 3 times
            backoff: {
                type: "exponential",
                delay: 2000, // Start with 2s delay, doubles on each retry
            },
            removeOnComplete: {
                count: 100, // Keep last 100 completed jobs
                age: 24 * 3600, // Keep for 24 hours
            },
            removeOnFail: {
                count: 50, // Keep last 50 failed jobs
                age: 7 * 24 * 3600, // Keep for 7 days
            },
        },
    },
);

// Random delay helper for simulating long-running downloads
const getRandomDelay = (): number => {
    const enabled = process.env.DOWNLOAD_DELAY_ENABLED === "true";
    if (!enabled) return 0;

    const min = parseInt(process.env.DOWNLOAD_DELAY_MIN_MS ?? "10000", 10);
    const max = parseInt(process.env.DOWNLOAD_DELAY_MAX_MS ?? "200000", 10);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Job processor function
const processDownloadJob = async (
    job: Job<DownloadJobData, DownloadJobResult>,
): Promise<DownloadJobResult> => {
    const { file_ids, jobId } = job.data;
    const totalFiles = file_ids.length;

    console.log(
        `[Queue Worker] Processing job ${jobId} with ${String(totalFiles)} files`,
    );

    let successCount = 0;
    let failedCount = 0;
    const downloadUrls: string[] = [];

    // Process each file with progress updates
    for (let i = 0; i < file_ids.length; i++) {
        const fileId = file_ids[i];
        const progress = Math.floor(((i + 1) / totalFiles) * 100);

        // Update job progress
        await job.updateProgress(progress);

        // Simulate download processing delay
        const delay = getRandomDelay();
        const delaySec = (delay / 1000).toFixed(1);

        console.log(
            `[Queue Worker] Job ${jobId}: Processing file ${String(fileId)} (${String(i + 1)}/${String(totalFiles)}) - delay ${delaySec}s`,
        );

        await sleep(delay);

        // Simulate file availability (same logic as main app)
        const available = fileId % 7 === 0;

        if (available) {
            successCount++;
            const s3Key = `downloads/${String(fileId)}.zip`;
            const downloadUrl = `https://storage.example.com/${s3Key}?token=${crypto.randomUUID()}`;
            downloadUrls.push(downloadUrl);
            console.log(
                `[Queue Worker] Job ${jobId}: File ${String(fileId)} - SUCCESS (${String(progress)}%)`,
            );
        } else {
            failedCount++;
            console.log(
                `[Queue Worker] Job ${jobId}: File ${String(fileId)} - NOT FOUND (${String(progress)}%)`,
            );
        }
    }

    const result: DownloadJobResult = {
        status: successCount > 0 ? "completed" : "failed",
        totalFiles,
        successCount,
        failedCount,
        downloadUrls: successCount > 0 ? downloadUrls : undefined,
        message:
            successCount > 0
                ? `Successfully processed ${String(successCount)}/${String(totalFiles)} files`
                : `All ${String(totalFiles)} files failed to process`,
    };

    console.log(
        `[Queue Worker] Job ${jobId} finished: ${String(successCount)} success, ${String(failedCount)} failed`,
    );

    return result;
};

// Create the worker
export const downloadWorker = new Worker<DownloadJobData, DownloadJobResult>(
    QUEUE_NAME,
    processDownloadJob,
    {
        connection: getRedisConnection(), // Worker needs its own connection
        concurrency: 5, // Process up to 5 jobs concurrently
    },
);

// Worker event handlers
downloadWorker.on("completed", (job) => {
    console.log(`[Queue Worker] Job ${String(job.id)} completed successfully`);
});

downloadWorker.on("failed", (job, err) => {
    console.error(
        `[Queue Worker] Job ${String(job?.id)} failed after ${String(job?.attemptsMade)} attempts:`,
        err.message,
    );
});

downloadWorker.on("error", (err) => {
    console.error("[Queue Worker] Worker error:", err);
});

// Graceful shutdown
export const shutdownQueue = async (): Promise<void> => {
    console.log("Shutting down queue and worker...");
    await downloadWorker.close();
    await downloadQueue.close();
    await connection.quit();
    console.log("Queue system shut down complete");
};
