import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsNumber()
  @IsEnum([1, 2]) // 1 = active, 2 = inactive
  isWorking: number;

  @IsString()
  instagram: string;

  @IsString()
  telegram: string;

  @IsString()
  facebook: string;

  @IsString()
  youtube: string;

  @IsNumber()
  phoneNumber: number;

  @IsString()
  email: string;

  @IsObject()
  address: {
    lat: number;
    lng: number;
  };
}
