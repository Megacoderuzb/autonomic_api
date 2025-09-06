import { PartialType } from '@nestjs/mapped-types';
import { CreateProductsDto } from './create-products.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductsDto extends PartialType(CreateProductsDto) {
      @IsString()
      @IsOptional()
      owner: string;
}
