import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  name: string;
}
