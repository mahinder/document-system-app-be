import { Injectable } from '@nestjs/common';
import { IngestionClient } from './ingestion.client';

@Injectable()
export class MockIngestionClient extends IngestionClient {
  async start(_documentId: string): Promise<{ accepted: boolean }> {
    // Always accept in mock
    return { accepted: true };
  }
}
