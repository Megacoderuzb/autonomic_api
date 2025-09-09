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
  minimalAmount: number;

  
  @IsString()
  currency: string;
}
