export class InitDemoGameDto {
  game_uuid: string;
  device?: 'desktop' | 'mobile' = 'desktop';
  return_url?: string;
  language?: string;
}

export class InitGameDto {
  game_uuid: string;
  language: string;
  return_url: string;
  device: 'desktop' | 'mobile' = 'desktop';
  player_id: string;
  player_name: string;
  currency: 'EUR';
  session_id: string;
}
