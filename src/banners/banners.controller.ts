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
import { BannerService } from './banners.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiOperation({ summary: 'Create a banner (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        buttonText: { type: 'string' },
        buttonLink: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: '/var/www/uploads/banners/',
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
  createBanner(@Body() body: any, @UploadedFile() file: any) {
    return this.bannerService.createBanner(body, file);
  }

  @ApiOperation({ summary: 'Get all banners' })
  @Get()
  getAllBanners() {
    return this.bannerService.getAllBanners();
  }

  @ApiOperation({ summary: 'Delete a banner (Admin only)' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
