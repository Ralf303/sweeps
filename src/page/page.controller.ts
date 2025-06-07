import {
  Controller,
  Get,
  Body,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PageService } from './page.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Page')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all page settings' })
  findAll() {
    return this.pageService.findAll();
  }

  @UseGuards(AdminGuard)
  @Post('title')
  @ApiOperation({ summary: 'Update page title' })
  updateTitle(@Body() dto: { title: string }) {
    return this.pageService.update(1, dto.title);
  }

  @UseGuards(AdminGuard)
  @Post('description')
  @ApiOperation({ summary: 'Update page description' })
  updateDescription(@Body() dto: { description: string }) {
    return this.pageService.update(2, dto.description);
  }

  @UseGuards(AdminGuard)
  @Post('icon')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace page icon' })
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: '/var/www/uploads/icons',
        filename: (_req, file, cb) => {
          const filename = `${Date.now()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  uploadIcon(@UploadedFile() file: Express.Multer.File) {
    return this.pageService.updateIcon(3, file.filename);
  }
}
