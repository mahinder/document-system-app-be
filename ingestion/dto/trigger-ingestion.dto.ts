import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerIngestionDto {
  @ApiProperty({ example: 'doc_123' })
  @IsString()
  documentId: string;
}
