import { Injectable, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doc } from './document.schema';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * Service responsible for managing blog documents with Redis caching.
 */
@Injectable()
export class DocumentService {
  consul: any;
  constructor(
    @InjectModel(Doc.name) private docModel: Model<Doc>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, 
    
  ) {}

 
  /**
   * Creates a new post and clears the cache.
   * @param {string} title - The title of the document.
   * @param {string} description - The description of the document.
   * @returns {Promise<Doc>} - The created document document.
   */
  async create(title: string, description: string, id: string, filePath: string): Promise<Doc> {
    const savedDoc = await this.docModel.create({ title, description, createdBy: id, filePath });

    // Clear cache when a new document is created
    await this.cacheManager.del('documents');

    return savedDoc;
  }

  /**
   * Retrieves all documents from Redis (if available) or MongoDB.
   * @returns {Promise<Post[]>} - An array of document documents.
   */
  async findAll(): Promise<Doc[]> {
    const cacheddocs = await this.cacheManager.get<Doc[]>('documents');

    if (cacheddocs) {
      console.log('Fetching docs from cache...');
      return cacheddocs;
    }

    console.log('Fetching docs from MongoDB...');
    const docs = await this.docModel.find().exec();

    // Store in cache for future requests (TTL: 60 sec)
    await this.cacheManager.set('docs', docs, 3660);

    return docs;
  }

  /**
   * Retrieves a docs by its ID from Redis (if available) or MongoDB.
   * @param {string} id - The ID of the document.
   * @returns {Promise<Doc>} - The found document.
   * @throws {NotFoundException} - If the document is not found.
   */
  async findById(id: string): Promise<Doc> {
    const cachedDoc = await this.cacheManager.get<Doc>(`doc_${id}`);

    if (cachedDoc) {
      console.log(`Fetching doc ${id} from cache...`);
      return cachedDoc;
    }

    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Doc with ID ${id} not found`);

    // Store in cache for 60 seconds
    await this.cacheManager.set(`doc_${id}`, doc, 60);

    return doc;
  }

  /**
   * Updates a doc and clears related cache.
   * @param {string} id - The ID of the doc to update.
   * @param {string} title - The updated title.
   * @param {string} description - The updated description.
   * @returns {Promise<Doc>} - The updated doc document.
   * @throws {NotFoundException} - If the doc is not found.
   */
  async update(id: string, title: string, description: string): Promise<Doc> {
    const updatedDoc = await this.docModel
      .findByIdAndUpdate(id, { title, description }, { new: true, runValidators: true })
      .exec();

    if (!updatedDoc) throw new NotFoundException(`Doc with ID ${id} not found`);

    // Clear cache for this document and all pdocuments list
    await this.cacheManager.del(`docs_${id}`);
    await this.cacheManager.del('docs');

    return updatedDoc;
  }

  /**
   * Deletes a doc and clears related cache.
   * @param {string} id - The ID of the doc to delete.
   * @returns {Promise<{ message: string }>} - A success message if deleted.
   * @throws {NotFoundException} - If the doc is not found.
   */
  async delete(id: string): Promise<{ message: string }> {
    const deletedDoc = await this.docModel.findByIdAndDelete(id).exec();

    if (!deletedDoc) throw new NotFoundException(`Doc with ID ${id} not found`);

    // Clear cache for this document and all documents list
    await this.cacheManager.del(`doc_${id}`);
    await this.cacheManager.del('docs');

    return { message: 'Document deleted successfully' };
  }
}
