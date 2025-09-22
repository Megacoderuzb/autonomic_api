import { Module } from '@nestjs/common';
import { CreditTypesService } from './credit-types.service';
import { CreditTypesController } from './credit-types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditTypes, CreditTypesSchema } from 'src/schemas/CreditTypes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CreditTypes.name, schema: CreditTypesSchema }]),
  ],
  controllers: [CreditTypesController],
  providers: [CreditTypesService],
})
export class CreditTypesModule { }
