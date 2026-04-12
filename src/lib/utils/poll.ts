export type GetJobStatus = (jobId: string) => Promise<{
  status: string;
  progress?: string;
  error?: string;
}>;

export function pollJob(
  jobId: string,
  getJobStatus: GetJobStatus,
  onProgress: ((p: string) => void) | null,
  onComplete: () => void,
  onError: (err: string) => void,
  intervalMs = 2000
): () => void {
  const timer = setInterval(async () => {
    try {
      const job = await getJobStatus(jobId);
      if (onProgress && job.progress) onProgress(job.progress);
      if (job.status === 'completed') { clearInterval(timer); onComplete(); }
      else if (job.status === 'failed') { clearInterval(timer); onError(job.error || 'Job failed'); }
    } catch {
      clearInterval(timer);
      onError('Lost connection');
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
