import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { SocialsService } from './socials.service';
import { UpdateSocialLinkDto, UpdateSocialTitleDto } from './dto/socials.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('socials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('socials')
export class SocialsController {
  constructor(private readonly socialsService: SocialsService) {}

  @ApiOperation({ summary: 'Получить все ссылки на социальные сети' })
  @ApiResponse({
    status: 200,
    description: 'Массив всех социальных ссылок',
    type: [UpdateSocialLinkDto],
  })
  @Get()
  async getAllSocialLinks(): Promise<any> {
    return this.socialsService.getAll();
  }

  @ApiOperation({ summary: 'Обновить ссылку социальной сети по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID социальной сети',
    example: 1,
    type: Number,
  })
  @ApiBody({
    description: 'DTO с URL для обновления',
    type: UpdateSocialLinkDto,
    examples: {
      example1: {
        value: { url: 'https://new-url.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Обновленная социальная ссылка',
    type: UpdateSocialLinkDto,
  })
  @UseGuards(AdminGuard)
  @Put(':id/link')
  async updateSocialLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialLinkDto,
  ): Promise<any> {
    return this.socialsService.updateLink(id, dto.url);
  }

  @ApiOperation({ summary: 'Обнвовить title social link' })
  @ApiParam({
    name: 'id',
    description: 'ID социальной сети',
    example: 1,
    type: Number,
  })
  @ApiBody({
    description: 'DTO с URL для обновления',
    type: UpdateSocialTitleDto,
    examples: {
      example1: {
        value: { title: 'title' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Обновленная социальная ссылка',
    type: UpdateSocialTitleDto,
  })
  @UseGuards(AdminGuard)
  @Put(':id/title')
  async updateSocialTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialTitleDto,
  ): Promise<any> {
    return this.socialsService.updateTitle(id, dto.title);
  }

  @UseGuards(AdminGuard)
  @Post(':id/icon')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: '/var/www/uploads/icons',
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          cb(null, `icon-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload icon for a social link' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Icon updated successfully' })
  async uploadIcon(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const iconPath = `/uploads/icons/${file.filename}`;
    return this.socialsService.updateIcon(id, iconPath);
  }
}
