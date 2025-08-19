import { IsString } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  login: string;

  @IsString()
  password: string;
}
