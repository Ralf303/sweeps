import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateSocialLinkDto {
  @ApiProperty({
    example: 'https://facebook.com/myprofile',
    description: 'URL социальной сети',
  })
  @IsUrl()
  url: string;
}
