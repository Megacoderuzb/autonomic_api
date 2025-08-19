import {
  Injectable,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { join } from 'path';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, unlinkSync } from 'fs';
import { FileDocument } from 'src/schemas/File.schema';

type File = {
  filename: string;
  path: string;
};

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
  ) {}
  async handleFile(file: File) {
    try {
      if (!file) {
        throw new BadRequestException('File must be provided');
      }

      const newFile = await this.fileModel.create({
        name: file.filename,
        path: file.path,
        url: `${process.env.SITE_URL}/files/${file.filename}`,
        lastRequest: Date.now(),
      });

      return {
        message: 'File uploaded successfully',
        data: newFile,
      };
    } catch (err: any) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  async getFile(name: string) {
    try {
      const findFile = await this.fileModel.findOne({ name });

      if (!findFile) {
        throw new BadRequestException('File not found');
      }

      const file = createReadStream(
        join(process.cwd(), 'uploads', findFile.name),
      );

      findFile.lastRequest = Date.now();
      await findFile.save();

      return new StreamableFile(file);
    } catch (err) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  @Cron('0 0 * * *')
  async deleteOldFiles() {
    const expiredTime = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const filesToDelete = await this.fileModel.find({
      lastRequest: { $lt: expiredTime },
    });

    for (const file of filesToDelete) {
      const filePath = join(process.cwd(), file.path);
      try {
        unlinkSync(filePath);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(`Failed to delete file at ${filePath}:`, err.message);
        } else {
          console.error(
            `Failed to delete file at ${filePath}:`,
            'Unknown error',
          );
        }
      }
    }

    await this.fileModel.deleteMany({
      lastRequest: { $lt: expiredTime },
    });
  }
}
