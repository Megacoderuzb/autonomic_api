import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { multerConfig } from './config/multer.config';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.handleFile(file);
  }

  @Get(':name')
  getFile(@Param('name') name: string) {
    return this.filesService.getFile(name);
  }
}
