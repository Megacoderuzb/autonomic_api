import { PartialType } from '@nestjs/mapped-types';
import { CreateClientTypesDto } from './create-client-types.dto';

export class UpdateClientTypesDto extends PartialType(CreateClientTypesDto) {}
