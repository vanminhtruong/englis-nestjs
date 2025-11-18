import { Injectable } from '@nestjs/common'
import { TagCrudService } from './tag-crud.service'
import { CreateTagDto } from '../dto/create-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'

@Injectable()
export class TagService {
  constructor(private readonly crudService: TagCrudService) {}

  async findAll(userId: string) {
    return this.crudService.findAll(userId)
  }

  async findById(id: string, userId: string) {
    return this.crudService.findById(id, userId)
  }

  async create(userId: string, createDto: CreateTagDto) {
    return this.crudService.create(userId, createDto)
  }

  async update(id: string, userId: string, updateDto: UpdateTagDto) {
    return this.crudService.update(id, userId, updateDto)
  }

  async delete(id: string, userId: string) {
    return this.crudService.delete(id, userId)
  }
}
