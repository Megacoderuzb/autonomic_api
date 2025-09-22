import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSalesDto {
  @IsString()
  @IsOptional()
  owner: string;

  @IsArray()
  products: {
    product: string;
    quantity: number;
  }[];

  @IsNumber()
  @IsOptional()
  total: number;

  @IsString()
  @IsOptional()
  client: string;

  @IsString()
  @IsOptional()
  saleType: string;
  
  @IsString()
  @IsOptional()
  currency: string;

  @IsNumber()
  @IsOptional()
  debtDeadline: number;


  @IsNumber()
  @IsOptional()
  paid: number;


  @IsArray()
  @IsOptional()
  payments: {
    method: string;
    amount: number;
    currency: string;
    date: Date;
  }[];

    @IsArray()
  @IsOptional()
  creditSchedule: {
    month: number;
    dueDate: Date;
    amount: number;
    currency: string;
    paid:  number;
  }[];

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;
}
