import { IsNumber, IsString } from 'class-validator';

export class ContactTelegramDto {
  @IsString()
  name: string;

  @IsNumber()
  number: number;

  @IsString()
  message: string;
}
