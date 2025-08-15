import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { Roles } from '../common/roles.decorator';

@ApiTags('Ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger document ingestion (mocked Python backend)' })
  @ApiCreatedResponse({ description: 'Ingestion started' })
  @Roles('Admin', 'Editor') // optional; adjust per your policy
  async trigger(@Body() dto: TriggerIngestionDto) {
    return this.ingestion.trigger(dto.documentId);
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get ingestion status by job ID' })
  @ApiOkResponse({ description: 'Current ingestion status' })
  async getStatus(@Param('jobId') jobId: string) {
    const status = await this.ingestion.getStatus(jobId);
    if (!status) throw new NotFoundException('Job not found');
    return status;
  }

  @Post('retry/:jobId')
  @ApiOperation({ summary: 'Retry ingestion for a failed job (creates a new job)' })
  @Roles('Admin', 'Editor') // optional
  async retry(@Param('jobId') jobId: string) {
    const status = await this.ingestion.retry(jobId);
    if (!status) throw new NotFoundException('Job not found');
    return status;
  }

  @Get('embeddings/:documentId')
  @ApiOperation({ summary: 'Get mock embeddings for a document' })
  async embeddings(@Param('documentId') documentId: string) {
    return this.ingestion.embeddings(documentId);
  }
}
