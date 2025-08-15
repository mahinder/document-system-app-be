import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IngestionClient } from './client/ingestion.client';
import { IngestionStore } from './store/ingestion.store';
import { IngestionStatus } from './interfaces/ingestion.types';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly client: IngestionClient,
    private readonly store: IngestionStore,
  ) {}

  async trigger(documentId: string): Promise<IngestionStatus> {
    const jobId = randomUUID();
    const now = new Date().toISOString();
    const status: IngestionStatus = {
      jobId,
      documentId,
      state: 'Processing',
      progress: 0,
      startedAt: now,
      updatedAt: now,
      error: null,
      embeddingsPreview: null,
    };

    await this.store.set(jobId, status);

    // mock “notify python”
    await this.client.start(documentId);

    // simulate progress
    this.simulate(jobId, documentId).catch((e) =>
      this.logger.error(`simulate failed: ${e?.message}`, e?.stack),
    );

    return status;
  }

  async getStatus(jobId: string): Promise<IngestionStatus | null> {
    return this.store.get(jobId);
  }

  async retry(jobId: string): Promise<IngestionStatus | null> {
    const prev = await this.store.get(jobId);
    if (!prev) return null;
    return this.trigger(prev.documentId);
  }

  async embeddings(documentId: string) {
    // stable pseudo-random vector based on documentId (mock)
    let seed = 0;
    for (let i = 0; i < documentId.length; i++) seed = (seed * 31 + documentId.charCodeAt(i)) >>> 0;
    const n = 16;
    const vec: number[] = [];
    for (let i = 0; i < n; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const val = (seed % 20000) / 10000 - 1; // [-1,1)
      vec.push(Number(val.toFixed(4)));
    }
    return { documentId, embedding: vec };
  }

  // ----- mock internal progress -----
  private async simulate(jobId: string, documentId: string) {
    const steps = [20, 60, 90, 100];
    for (const p of steps) {
      await new Promise((res) => setTimeout(res, 700));
      const cur = await this.store.get(jobId);
      if (!cur) return;
      cur.progress = p;
      cur.updatedAt = new Date().toISOString();
      await this.store.set(jobId, cur);
    }

    const final = await this.store.get(jobId);
    if (!final) return;

    const success = Math.random() < 0.85;
    final.state = success ? 'Completed' : 'Failed';
    final.progress = 100;
    final.updatedAt = new Date().toISOString();
    final.error = success ? null : 'Mocked ingestion error';
    final.embeddingsPreview = success
      ? Array.from({ length: 8 }, () => Number((Math.random() * 2 - 1).toFixed(4)))
      : null;

    await this.store.set(jobId, final);
  }
}
