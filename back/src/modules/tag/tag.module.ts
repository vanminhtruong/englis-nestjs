import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Tag } from '../../entities/tag.entity'
import { TagController } from './tag.controller'
import { TagService } from './services/tag.service'
import { TagCrudService } from './services/tag-crud.service'
import { TagRepository } from './repositories/tag.repository'
import { WebsocketModule } from '../websocket/websocket.module'

@Module({
  imports: [TypeOrmModule.forFeature([Tag]), WebsocketModule],
  controllers: [TagController],
  providers: [TagService, TagCrudService, TagRepository],
  exports: [TagService],
})
export class TagModule {}
