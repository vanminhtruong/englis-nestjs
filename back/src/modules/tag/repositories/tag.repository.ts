import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tag } from '../../../entities/tag.entity'
import { CreateTagDto } from '../dto/create-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
  ) {}

  async findAll(userId: string): Promise<Tag[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, userId: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { id, userId } })
  }

  async create(userId: string, createDto: CreateTagDto): Promise<Tag> {
    const tag = this.repository.create({
      ...createDto,
      userId,
    })
    return this.repository.save(tag)
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTagDto,
  ): Promise<Tag | null> {
    const tag = await this.findById(id, userId)
    if (!tag) return null

    Object.assign(tag, updateDto)
    return this.repository.save(tag)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repository.delete({ id, userId })
  }
}
