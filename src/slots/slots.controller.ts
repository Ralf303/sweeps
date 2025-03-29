import { Controller, Post, Body, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('slots')
export class SlotsController {
  private readonly logger = new Logger(SlotsController.name);

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
      }

      const now = new Date();
      const fileName = `webhook-${now.toISOString().replace(/[:.]/g, '-')}.txt`;
      const filePath = path.join(logsDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

      this.logger.log(`Webhook saved to ${filePath}`);
      return { success: true, message: 'Webhook received and saved' };
    } catch (error) {
      this.logger.error('Error saving webhook', error);
      throw error;
    }
  }
}
