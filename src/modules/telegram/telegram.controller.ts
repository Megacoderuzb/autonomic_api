import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ContactTelegramService } from './telegram.service';
import { Response } from 'express';
import { ContactTelegramDto } from './dto/telegram.dto';

@Controller('contact')
export class ContactTelegramController {
  constructor(private readonly contactService: ContactTelegramService) {}

  @Post('telegram')
  async sendContact(
    @Body() body: ContactTelegramDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.contactService.sendContactToTelegram(
        body.name,
        body.number,
        body.message,
      );
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error: any) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
