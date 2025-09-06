import { IsOptional, IsString } from 'class-validator';

export class CreateModelsDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  name: string;
}
