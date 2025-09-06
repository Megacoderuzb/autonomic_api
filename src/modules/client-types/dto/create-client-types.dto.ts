import { IsOptional, IsString } from 'class-validator';

export class CreateClientTypesDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsString()
  typeUz: string;

  @IsString()
  typeRu: string;
}
