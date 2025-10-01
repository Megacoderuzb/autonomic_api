import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sales, SalesSchema } from 'src/schemas/Sales.schema';
import { Products, ProductsSchema } from 'src/schemas/Product.schema';
import { CreditTypes, CreditTypesSchema } from 'src/schemas/CreditTypes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sales.name, schema: SalesSchema },
      { name: Products.name, schema: ProductsSchema }, 
      { name: CreditTypes.name, schema: CreditTypesSchema}
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
