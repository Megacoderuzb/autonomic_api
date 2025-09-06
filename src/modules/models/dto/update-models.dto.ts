import { PartialType } from '@nestjs/mapped-types';
import { CreateModelsDto } from './create-models.dto';

export class UpdateModelsDto extends PartialType(CreateModelsDto) {}
