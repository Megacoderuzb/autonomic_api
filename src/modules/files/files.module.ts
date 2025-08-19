import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from 'src/schemas/File.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
