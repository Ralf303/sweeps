import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UpdateSocialLinkDto {
  @ApiProperty({
    example: 'https://facebook.com/myprofile',
    description: 'URL социальной сети',
  })
  @IsUrl()
  url: string;
}

export class UpdateSocialTitleDto {
  @ApiProperty({
    example: 'Net inst',
    description: 'new title',
  })
  @IsString()
  title: string;
}
