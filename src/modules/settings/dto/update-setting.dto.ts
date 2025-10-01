import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  currencyRate: {
    cbu: number;
    manual: number;
    selected: string;
    logs: {
      date: number,
      cbu: number,
      manual: number,
      selected: { type: string, enum: ['cbu', 'manual'], default: 'cbu'},
    }[]
  };

  @IsObject()
  address: {
    lat: number;
    lng: number;
  };
}
