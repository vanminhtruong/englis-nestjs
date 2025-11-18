import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { VoiceService } from './services/voice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getVoices() {
    return this.voiceService.getAllActive();
  }

  @Post('preferred')
  @UseGuards(JwtAuthGuard)
  async setPreferred(@Request() req, @Body() body: { voiceKey: string }) {
    return this.voiceService.setPreferredVoice(req.user.id, body.voiceKey);
  }
}


