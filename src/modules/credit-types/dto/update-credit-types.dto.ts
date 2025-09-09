import { PartialType } from '@nestjs/mapped-types';
import { CreateCreditTypesDto } from './create-credit-types.dto';

export class UpdateCreditTypesDto extends PartialType(CreateCreditTypesDto) {}
