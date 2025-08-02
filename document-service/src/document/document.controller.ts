import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Express } from 'express';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all documents',
    description: 'Returns a list of all documents',
  })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get document by ID',
    description: 'Returns a single document by its ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Document ID',
    example: '65e1234abcd56789efgh',
  })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findById(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({
    summary: 'Create a document',
    description: 'Creates a new document with file upload',
  })
  @ApiBody({ description: 'Document data', type: Object })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const { title, description, createdBy } = body;
    return this.documentService.create(
      title,
      description,
      createdBy,
      file.path,
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a document',
    description: 'Updates an existing document',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Document ID',
    example: '65e1234abcd56789efgh',
  })
  @ApiBody({ description: 'Document data', type: Object })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(@Param('id') id: string, @Body() body: any) {
    const { title, description } = body;
    return this.documentService.update(id, title, description);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Deletes a document by its ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Document ID',
    example: '65e1234abcd56789efgh',
  })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }

  @MessagePattern({ cmd: 'get_document_by_id' })
  async findByIdTCP(@Payload('id') data: any) {
    console.log('Received TCP request for GET ID:', JSON.stringify(data));
    return this.documentService.findById(data);
  }

  @MessagePattern({ cmd: 'create_document' })
  async createDocumentTCP(@Payload() data: any) {
    console.log('Received TCP request for document ID:', JSON.stringify(data));
    return this.documentService.create(data.title, data.description, data.id, data.filePath);
  }

  @MessagePattern({ cmd: 'get_all_document' })
  async findAllTCP() {
    return this.documentService.findAll();
  }

  @MessagePattern({ cmd: 'update_document' })
  async updateDocumentTCP(@Payload() data: any) {
    console.log('Received TCP request for update document:', JSON.stringify(data));
    let val = data.data;
    return this.documentService.update(val.id, val.title, val.description);
  }
}
