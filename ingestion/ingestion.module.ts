import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IngestionStore } from './store/ingestion.store';
import { CacheIngestionStore } from './store/cache-ingestion.store';
import { IngestionClient } from './client/ingestion.client';
import { MockIngestionClient } from './client/mock-ingestion.client';

@Module({
  imports: [CacheModule.register()],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    { provide: IngestionStore, useClass: CacheIngestionStore },
    { provide: IngestionClient, useClass: MockIngestionClient }, // swap here for real Python client later
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
