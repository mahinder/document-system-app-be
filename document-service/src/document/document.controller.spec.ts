import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './Document.service';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockDocument = { _id: '1', title: 'Test Post', description: 'Test Description', createdBy: '123' };

  const mockDocumentService = {
    findAll: jest.fn().mockResolvedValue([mockDocument]),
    findById: jest.fn().mockImplementation((id) => {
      console.log('findBy id ', id)
      return id === '1' ? Promise.resolve(mockDocument) : Promise.reject(new NotFoundException());
    }),

    create: jest.fn().mockImplementation((title, description, id) => {
      return Promise.resolve({ _id: '2', title, description, createdBy: id });
    }),
    update: jest.fn().mockImplementation((id, title, description) => {
      return id === '1'
        ? Promise.resolve({ _id: '1', title, description, createdBy: '123' })
        : Promise.reject(new NotFoundException());
    }),
    delete: jest.fn().mockImplementation((id) => {
      return id === '1' ? Promise.resolve({ message: 'Post deleted successfully' }) : Promise.reject(new NotFoundException());
    }),
    findAllTCP: jest.fn().mockResolvedValue([mockDocument]),
    createdocumentTCP: jest.fn().mockImplementation(({ title, description, id }) => {
      return Promise.resolve({ _id: '2', title, description, createdBy: id });
    }),
    updateDocumentTCP: jest.fn().mockImplementation(({ data }) => {
      return data.id === '1'
        ? Promise.resolve({ _id: '1', title: data.title, description: data.description, createdBy: '123' })
        : Promise.reject(new NotFoundException());
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      expect(await controller.findAll()).toEqual([mockDocument]);
    });
  });

  describe('findById', () => {
    it('should return a post if found', async () => {
      expect(await controller.findById('1')).toEqual(mockDocument);
    });

    it('should throw NotFoundException if post is not found', async () => {
      await expect(controller.findById('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDocumentTCP', () => {
    it('should create and return a new post', async () => {
      const newPost = await controller.createDocumentTCP({ title: 'New Post', description: 'New Description', id: '123' });
      expect(newPost).toEqual({ _id: '2', title: 'New Post', description: 'New Description', createdBy: '123' });
    });
  });



  describe('updateDocumentTCP', () => {
    it('should update and return a post', async () => {
      expect(await controller.updateDocumentTCP({ data: { id: '1', title: 'Updated Title', description: 'Updated Description' } })).toEqual({
        _id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        createdBy: '123',
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      await expect(controller.updateDocumentTCP({ data: { id: '2', title: 'Title', description: 'Description' } })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a post and return success message', async () => {
      expect(await controller.delete('1')).toEqual({ message: 'Document deleted successfully' });
    });

    it('should throw NotFoundException if document is not found', async () => {
      await expect(controller.delete('2')).rejects.toThrow(NotFoundException);
    });
  });
});
