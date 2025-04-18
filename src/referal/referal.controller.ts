import { Controller } from '@nestjs/common';
import { ReferalService } from './referal.service';

@Controller('referal')
export class ReferalController {
  constructor(private readonly referalService: ReferalService) {}
}
