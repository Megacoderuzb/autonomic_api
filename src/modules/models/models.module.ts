import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Models, ModelsSchema } from 'src/schemas/Model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Models.name, schema: ModelsSchema }]),
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class ModelsModule {}
