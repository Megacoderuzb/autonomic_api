import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ContactTelegramService {
  async sendContactToTelegram(
    name: string,
    number: number,
    message: string,
  ): Promise<void> {
    const text = `👤 Ism: ${name}\n📱 Raqam: +${number}\n💬 Xabar: ${message}`;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    await axios.post(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        chat_id: chatId,
        text,
      },
    );
  }
}
