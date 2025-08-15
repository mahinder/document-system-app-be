import { IngestionStatus } from '../interfaces/ingestion.types';

export abstract class IngestionStore {
  abstract set(jobId: string, status: IngestionStatus, ttlSeconds?: number): Promise<void>;
  abstract get(jobId: string): Promise<IngestionStatus | null>;
}
