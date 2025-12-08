import { Controller, Get, Query, Param } from '@nestjs/common';
import { BackgroundService } from '../services/background.service';

@Controller('backgrounds')
export class BackgroundController {
    constructor(private readonly backgroundService: BackgroundService) { }

    @Get()
    async findAll(@Query('category') category?: string) {
        if (category) {
            return this.backgroundService.findByCategory(category);
        }
        return this.backgroundService.findAll();
    }

    @Get('categories')
    async getCategories() {
        return this.backgroundService.getCategories();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.backgroundService.findOne(id);
    }
}
