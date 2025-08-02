import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Doc } from './document.schema';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentModel: Model<Doc>;
  let cacheManager: any;

  const mockDocument = { _id: '1', title: 'Test Document', description: 'Test Description', createdBy: '123' };

  const mockDocumentModel = {
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockDocument]) }),
    findById: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? mockDocument : null),
    })),
    findByIdAndUpdate: jest.fn().mockImplementation((id, update) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? { ...mockDocument, ...update } : null),
    })),
    findByIdAndDelete: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? mockDocument : null),
    })),
    create: jest.fn().mockImplementation((dto) => ({
      _id: '2',
      ...dto,
    })),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: getModelToken(Doc.name), useValue: mockDocumentModel },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentModel = module.get<Model<Doc>>(getModelToken(Doc.name));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      expect(await service.findAll()).toEqual([mockDocument]);
    });
  });

  describe('findById', () => {
    it('should return a document if found', async () => {
      expect(await service.findById('1')).toEqual(mockDocument);
    });

    it('should throw NotFoundException if document is not found', async () => {
      mockDocumentModel.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findById('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new document', async () => {
      const newDocument = await service.create('New Doc', 'New Description', '123', '/path/to/file');
      expect(newDocument).toEqual({ _id: '2', title: 'New Doc', description: 'New Description', createdBy: '123' });
    });
  });

  describe('update', () => {
    it('should update and return a document', async () => {
      expect(await service.update('1', 'Updated Title', 'Updated Description')).toEqual({
        _id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        createdBy: '123',
      });
    });

    it('should throw NotFoundException if document is not found', async () => {
      mockDocumentModel.findByIdAndUpdate.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.update('2', 'Title', 'Description')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a doc and return success message', async () => {
      expect(await service.delete('1')).toEqual({ message: 'Doc deleted successfully' });
    });

    it('should throw NotFoundException if document is not found', async () => {
      mockDocumentModel.findByIdAndDelete.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.delete('2')).rejects.toThrow(NotFoundException);
    });
  });
});
