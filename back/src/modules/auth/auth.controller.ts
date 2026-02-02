import {
    Controller,
    Post,
    Body,
    Get,
    Put,
    UseGuards,
    Request,
    Res,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VocabularyWebSocketGateway } from '../websocket/websocket.gateway';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateLayoutPreferenceDto } from './dto/update-layout-preference.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly websocketGateway: VocabularyWebSocketGateway,
    ) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return {
            id: req.user.id,
            email: req.user.email,
            fullName: req.user.fullName,
            avatar: req.user.avatar,
            totalScore: req.user.totalScore,
            totalWords: req.user.totalWords,
            theme: req.user.theme || 'light',
            vocabularyLayout: req.user.vocabularyLayout || 'grid',
        };
    }

    @Put('theme')
    @UseGuards(JwtAuthGuard)
    async updateTheme(@Request() req, @Body() body: { theme: string }) {
        const updatedUser = await this.authService.updateTheme(
            req.user.id,
            body.theme,
        );

        if (!updatedUser) {
            throw new Error('Failed to update theme');
        }

        // Emit WebSocket event for real-time theme sync
        this.websocketGateway.emitThemeChanged(req.user.id, body.theme);

        return {
            id: updatedUser.id,
            theme: updatedUser.theme,
        };
    }

    @Post('recalculate-words')
    @UseGuards(JwtAuthGuard)
    async recalculateTotalWords(@Request() req) {
        const result = await this.authService.recalculateTotalWords(req.user.id);
        return result;
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
        const profile = await this.authService.updateProfile(req.user.id, body);

        this.websocketGateway.emitProfileUpdated(req.user.id, profile);

        return profile;
    }

    @Put('layout')
    @UseGuards(JwtAuthGuard)
    async updateVocabularyLayout(
        @Request() req,
        @Body() body: UpdateLayoutPreferenceDto,
    ) {
        const updatedUser = await this.authService.updateVocabularyLayout(
            req.user.id,
            body.layout,
        );

        if (!updatedUser) {
            throw new Error('Failed to update vocabulary layout preference');
        }

        this.websocketGateway.emitLayoutChanged(req.user.id, body.layout);

        return {
            id: updatedUser.id,
            vocabularyLayout: updatedUser.vocabularyLayout || 'grid',
        };
    }

    @Get('export')
    @UseGuards(JwtAuthGuard)
    async exportData(@Request() req, @Res() res: Response) {
        const buffer = await this.authService.exportUserData(req.user.id);

        res.set({
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="profile_export.xlsx"',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Post('import')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importData(@Request() req, @UploadedFile() file: Express.Multer.File) {
        return this.authService.importUserData(req.user.id, file);
    }
}
