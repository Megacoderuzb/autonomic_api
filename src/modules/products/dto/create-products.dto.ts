import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductsDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  color: string;

  @IsString()
  category: string;

  @IsString()
  storage: string;

  @IsString()
  problem: string;

  @IsString()
  region: string;

  @IsNumber()
  originalPrice: number;

  @IsNumber()
  salePrice: number;

  @IsString()
  condition: string;

    @IsString()
  currency: string;

}
