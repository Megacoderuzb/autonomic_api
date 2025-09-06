import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  nameUz: string;

  @IsString()
  nameRu: string;
}
