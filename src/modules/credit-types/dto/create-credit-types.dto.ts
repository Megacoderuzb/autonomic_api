import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCreditTypesDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  percentage: number;

  @IsNumber()
  minimal: number;

  @IsNumber()
  @IsOptional()
  minimalAmount: number;

  
  @IsString()
  @IsOptional()
  currency: string;
}
