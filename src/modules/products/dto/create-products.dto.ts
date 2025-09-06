import { IsOptional, IsString } from 'class-validator';

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

  @IsString()
  originalPrice: string;

  @IsString()
  salePrice: string;

  @IsString()
  condition: string;

}
