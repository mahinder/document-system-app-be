import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Doc, DocumentSchema } from './document.schema';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doc.name, schema: DocumentSchema }]),
    CacheModule.register({
      store: redisStore,
      host: 'redis', // Update if using Docker (use service name)
      port: 6379,
      ttl: 3600, // Cache expiration time in seconds
    }),

  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule { }
