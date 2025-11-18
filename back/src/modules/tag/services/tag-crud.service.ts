import { Injectable } from '@nestjs/common'
import { TagRepository } from '../repositories/tag.repository'
import { CreateTagDto } from '../dto/create-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'

@Injectable()
export class TagCrudService {
  constructor(private readonly tagRepository: TagRepository) {}

  async findAll(userId: string) {
    return this.tagRepository.findAll(userId)
  }

  async findById(id: string, userId: string) {
    return this.tagRepository.findById(id, userId)
  }

  async create(userId: string, createDto: CreateTagDto) {
    return this.tagRepository.create(userId, createDto)
  }

  async update(id: string, userId: string, updateDto: UpdateTagDto) {
    return this.tagRepository.update(id, userId, updateDto)
  }

  async delete(id: string, userId: string) {
    return this.tagRepository.delete(id, userId)
  }
}
