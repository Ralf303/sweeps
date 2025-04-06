export class InitDemoGameDto {
  game_uuid: string;
  device?: 'desktop' | 'mobile' = 'desktop';
  return_url?: string;
  language?: string;
}
