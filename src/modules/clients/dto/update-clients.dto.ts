import { PartialType } from '@nestjs/mapped-types';
import { CreateClientsDto } from './create-clients.dto';
import { IsObject, IsString } from 'class-validator';

export class UpdateClientsDto extends PartialType(CreateClientsDto) {}