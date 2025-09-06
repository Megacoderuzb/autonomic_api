import { Module } from '@nestjs/common';
import { ClientTypesService } from './client-types.service';
import { ClientTypesController } from './client-types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientTypes, ClientTypesSchema } from 'src/schemas/ClientTypes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClientTypes.name, schema: ClientTypesSchema }]),
  ],
  controllers: [ClientTypesController],
  providers: [ClientTypesService],
})
export class ClientTypesModule {}
