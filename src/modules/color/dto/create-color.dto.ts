import { IsOptional, IsString } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  hex: string;
}
