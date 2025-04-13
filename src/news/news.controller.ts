import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { NewsService } from './news.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({ summary: 'Create a news (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: '/var/www/uploads/news/',
        filename: (
          _: any,
          file: { originalname: string },
          cb: (arg0: null, arg1: string) => void,
        ) => {
          const filename = `${Date.now()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  createNews(@Body() body: any, @UploadedFile() file: any) {
    return this.newsService.createNews(body, file);
  }

  @ApiOperation({ summary: 'Get all news' })
  @Get()
  getAllNews() {
    return this.newsService.getAllNews();
  }

  @ApiOperation({ summary: 'Delete a news (Admin only)' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteNews(@Param('id') id: string) {
    return this.newsService.deleteNews(id);
  }
}
