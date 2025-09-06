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
import { ClientTypesService } from './client-types.service';
import { CreateClientTypesDto } from './dto/create-client-types.dto';
import { UpdateClientTypesDto } from './dto/update-client-types.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('client-types')
export class ClientTypesController {
  constructor(private readonly clientTypesService: ClientTypesService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.clientTypesService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string,@Query() query: CustomQuery,@Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.clientTypesService.getById(id, query, req);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createClientTypesDto: CreateClientTypesDto, @Req() req: any) {
    createClientTypesDto.owner =  req.user.id
    return await this.clientTypesService.create(createClientTypesDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateClientTypesDto: UpdateClientTypesDto) {
    return await this.clientTypesService.update(req.user.id, updateClientTypesDto);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateClientTypesDto: UpdateClientTypesDto,
  ) {
    return await this.clientTypesService.update(id, updateClientTypesDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    return await this.clientTypesService.remove(id,req.user.id);
  }

}
