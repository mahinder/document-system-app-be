import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { IngestionStore } from './ingestion.store';
import { IngestionStatus } from '../interfaces/ingestion.types';

@Injectable()
export class CacheIngestionStore extends IngestionStore {
  private key(jobId: string) { return `ingestion:${jobId}`; }

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) { super(); }

  async set(jobId: string, status: IngestionStatus, ttlSeconds = 60 * 60 * 24) {
    await this.cache.set(this.key(jobId), status, ttlSeconds);
  }

  async get(jobId: string): Promise<IngestionStatus | null> {
    return (await this.cache.get<IngestionStatus>(this.key(jobId))) ?? null;
  }
}
