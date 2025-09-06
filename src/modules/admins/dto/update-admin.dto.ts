import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { IsObject, IsString } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) { }
export class AddPaymentDto {
    @IsObject()
    payment: {
        dueDate: number;
        amount: number;
        promocode: {
            amount: number;
            percentage: number;
        };
    };
}