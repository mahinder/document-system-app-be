export type IngestionState = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface IngestionStatus {
  jobId: string;
  documentId: string;
  state: IngestionState;
  progress: number;     // 0..100
  startedAt: string;    // ISO
  updatedAt: string;    // ISO
  error?: string | null;
  embeddingsPreview?: number[] | null;
}
