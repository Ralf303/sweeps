import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SignatureService } from './signature.service';
import { InitDemoGameDto, InitGameDto } from '../dto/init.demo.game.dto';
import { join } from 'path';
import { writeFile } from 'fs';
import { inspect } from 'util';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SlotegratorService {
  private readonly apiUrl = 'https://staging.slotegrator.com/api/index.php/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly signatureService: SignatureService,
    private readonly redisService: RedisService,
  ) {}

  async getGames(params?: any): Promise<any> {
    const { headers } = this.signatureService.generateHeaders(params);

    const response = await firstValueFrom(
      this.httpService.get(`${this.apiUrl}/games/index`, {
        params,
        headers,
      }),
    );

    return response.data;
  }

  async initDemoGame(params: InitDemoGameDto): Promise<any> {
    const { headers } = this.signatureService.generateHeaders(params);

    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value.toString());
    });

    const response = await firstValueFrom(
      this.httpService.post<any>(`${this.apiUrl}/games/init-demo`, formData, {
        headers,
      }),
    );

    return response.data;
  }

  async initGame(params: InitGameDto): Promise<any> {
    try {
      const { headers } = this.signatureService.generateHeaders(params);

      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });

      const response = await firstValueFrom(
        this.httpService.post<any>(`${this.apiUrl}/games/init`, formData, {
          headers,
        }),
      );

      await this.redisService.setGameMode(params.player_id, params.game_name);
      return response.data;
    } catch (error: any) {
      console.error(error);

      const errorData = inspect(error, { depth: null, colors: false });

      const filePath = join(__dirname, 'error.txt');
      writeFile(filePath, errorData, (err) => {
        if (err) {
          console.error('Не удалось записать файл:', err);
        } else {
          console.log('Полный ответ с ошибкой записан в файл:', filePath);
        }
      });
    }
  }

  async getValidate(): Promise<any> {
    const { headers } = this.signatureService.generateHeaders();

    const response = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/self-validate`, {}, { headers }),
    );
    return response.data;
  }
}
