import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelsDto } from './dto/create-models.dto';
import { UpdateModelsDto } from './dto/update-models.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = process.env.SITE_URL;
    return await this.modelsService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string) {
    
    return await this.modelsService.getById(id);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createModelsDto: CreateModelsDto, @Req() req: any) {
    createModelsDto.owner =  req.user.id
    return await this.modelsService.create(createModelsDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateModelsDto: UpdateModelsDto) {
    return await this.modelsService.update(req.user.id, updateModelsDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateModelsDto: UpdateModelsDto,
  ) {
    return await this.modelsService.update(id, updateModelsDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    return await this.modelsService.remove(id,req.user.id);
  }

}
