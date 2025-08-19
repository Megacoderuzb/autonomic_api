import { Module } from '@nestjs/common';
import { ContactTelegramController } from './telegram.controller';
import { ContactTelegramService } from './telegram.service';

@Module({
  controllers: [ContactTelegramController],
  providers: [ContactTelegramService],
})
export class ContactTelegramModule {}