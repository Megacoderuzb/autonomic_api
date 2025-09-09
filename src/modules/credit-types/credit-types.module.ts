import { Module } from '@nestjs/common';
import { CreditTypesService } from './credit-types.service';
import { CreditTypesController } from './credit-types.controller';

@Module({
  controllers: [CreditTypesController],
  providers: [CreditTypesService],
})
export class CreditTypesModule {}
