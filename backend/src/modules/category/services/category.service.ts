import {
  CategoryRepository,
  CreateCategoryData,
  UpdateCategoryData
} from '../repositories/category.repository.js';

import { Category } from '../models/category.model.js';

export class CategoryService {

  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository =
      new CategoryRepository();
  }

  async getAllCategories(
    userId: number
  ): Promise<Category[]> {

    return this.categoryRepository.findAll(
      userId
    );
  }

  async getCategoryById(
    id: number,
    userId: number
  ): Promise<Category | null> {

    return this.categoryRepository.findById(
      id,
      userId
    );
  }

  async createCategory(
    data: CreateCategoryData
  ): Promise<Category> {

    return this.categoryRepository.create(
      data
    );
  }

  async updateCategory(
    id: number,
    userId: number,
    data: UpdateCategoryData
  ): Promise<Category | null> {

    return this.categoryRepository.update(
      id,
      userId,
      data
    );
  }

  async deleteCategory(
    id: number,
    userId: number
  ): Promise<boolean> {

    return this.categoryRepository.delete(
      id,
      userId
    );
  }
}